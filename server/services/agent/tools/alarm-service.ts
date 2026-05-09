import { exec } from 'child_process';
import { promisify } from 'util';
import logger from 'electron-log';

const execAsync = promisify(exec);

/**
 * 闹钟结果
 */
export interface AlarmResult {
  success: boolean;
  message: string;
  alarmId?: string;
  scheduledTime?: string;
  error?: string;
}

/**
 * 闹钟信息
 */
interface Alarm {
  id: string;
  title: string;
  time: Date;
  timeoutId: NodeJS.Timeout;
}

/**
 * 活跃闹钟映射
 */
const activeAlarms: Map<string, Alarm> = new Map();

/**
 * 生成唯一闹钟 ID
 */
const generateAlarmId = (): string => {
  return `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 使用 osascript 发送 macOS 系统通知
 * @param title 通知标题
 * @param body 通知内容
 */
const sendMacOSNotification = async (title: string, body: string): Promise<void> => {
  // 使用 osascript 执行 AppleScript 显示通知
  const script = `display notification "${body.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"`;
  const cmd = `osascript -e '${script}'`;

  try {
    await execAsync(cmd);
    logger.info('[AlarmService] macOS notification sent:', title);
  } catch (error) {
    logger.error('[AlarmService] Failed to send macOS notification:', error);
    // 尝试 fallback 到 terminal-notifier
    try {
      await execAsync(`terminal-notifier -title "${title}" -message "${body}"`);
      logger.info('[AlarmService] terminal-notifier fallback notification sent');
    } catch {
      logger.error('[AlarmService] terminal-notifier also failed');
    }
  }
};

/**
 * 解析自然语言时间表达
 * 支持格式：
 * - "2小时后"、"3小时30分钟后"
 * - "明天下午3点"、"今天上午9点"
 * - "晚上8点"、"下午3点半"
 * - "半小时后"、"15分钟后"
 * @param timeStr 自然语言时间表达
 * @returns 解析后的 Date 对象，如果解析失败返回 null
 */
const parseNaturalLanguageTime = (timeStr: string): Date | null => {
  const now = new Date();
  const lowerStr = timeStr.toLowerCase().trim();

  // 半小时后、15分钟后、1小时后 等
  const relativeMatch = lowerStr.match(
    /^(\d+)\s*小时\s*(\d+)?\s*分\s*钟?\s*后?$|^(\d+)\s*分\s*钟?\s*后?$|^半\s*小\s*时?\s*后?$/,
  );
  if (relativeMatch) {
    const hours = relativeMatch[1] ? parseInt(relativeMatch[1]) : 0;
    const minutes = relativeMatch[2]
      ? parseInt(relativeMatch[2])
      : relativeMatch[0].includes('半')
        ? 30
        : relativeMatch[3]
          ? parseInt(relativeMatch[3])
          : 0;
    const totalMs = (hours * 60 + minutes) * 60 * 1000;
    return new Date(now.getTime() + totalMs);
  }

  // 明天下午3点、今天上午9点 等
  const dayTimeMatch = lowerStr.match(
    /^(今天|明天|后天)?\s*(上午|下午|晚上|早上|中午|凌晨|傍晚)?\s*(\d{1,2})\s*[点时:：]\s*(\d{1,2})?/,
  );
  if (dayTimeMatch) {
    const day = dayTimeMatch[1];
    const timeOfDay = dayTimeMatch[2];
    let hours = parseInt(dayTimeMatch[3]);
    const minutes = dayTimeMatch[4] ? parseInt(dayTimeMatch[4]) : 0;

    // 转换 12 小时制到 24 小时制
    if (timeOfDay === '下午' || timeOfDay === '晚上' || timeOfDay === '傍晚') {
      if (hours < 12) hours += 12;
    } else if (timeOfDay === '凌晨' || timeOfDay === '早上' || timeOfDay === '上午') {
      if (hours === 12) hours = 0;
    }

    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);

    // 处理日期
    if (day === '明天') {
      result.setDate(result.getDate() + 1);
    } else if (day === '后天') {
      result.setDate(result.getDate() + 2);
    } else if (day === '今天' || !day) {
      // 如果时间已经过了，就默认是明天
      if (result.getTime() <= now.getTime()) {
        result.setDate(result.getDate() + 1);
      }
    }

    return result;
  }

  // 简单的小时分钟后，如 "3点半"、"8点30分"
  const simpleTimeMatch = lowerStr.match(/^(\d{1,2})\s*[点时:：]\s*(\d{1,2})?\s*分?$/);
  if (simpleTimeMatch) {
    let hours = parseInt(simpleTimeMatch[1]);
    const minutes = simpleTimeMatch[2] ? parseInt(simpleTimeMatch[2]) : 0;

    // 假设 0-5 是凌晨，6-11 是上午，12 是中午，13-17 是下午，18-23 是晚上
    if (hours < 6) {
      // 凌晨时间默认是明天
    } else if (hours < 12) {
      // 上午
    } else if (hours === 12) {
      // 中午
    } else if (hours < 18) {
      hours += 0; // 下午
    } else {
      // 晚上
    }

    const result = new Date(now);
    result.setHours(hours, minutes, 0, 0);

    // 如果时间已经过了，就默认是明天
    if (result.getTime() <= now.getTime()) {
      result.setDate(result.getDate() + 1);
    }

    return result;
  }

  // 尝试直接解析 ISO 或标准时间格式
  const directDate = new Date(timeStr);
  if (!isNaN(directDate.getTime()) && directDate.getTime() > now.getTime()) {
    return directDate;
  }

  return null;
};

/**
 * 设置闹钟
 * @param title 闹钟标题
 * @param timeStr 闹钟时间（自然语言表达或 ISO 格式）
 * @returns 闹钟结果
 */
export const setAlarm = async (title: string, timeStr: string): Promise<AlarmResult> => {
  if (!title) {
    return {
      success: false,
      message: '闹钟标题不能为空',
      error: 'Missing title parameter',
    };
  }

  if (!timeStr) {
    return {
      success: false,
      message: '闹钟时间不能为空',
      error: 'Missing time parameter',
    };
  }

  try {
    // 解析时间（支持自然语言）
    let alarmTime = parseNaturalLanguageTime(timeStr);

    // 如果自然语言解析失败，尝试 ISO 格式
    if (!alarmTime) {
      alarmTime = new Date(timeStr);
    }

    if (!alarmTime || isNaN(alarmTime.getTime())) {
      return {
        success: false,
        message: `无法解析时间「${timeStr}」，支持格式如：2小时后、明天下午3点、今天上午9点30分等`,
        error: 'Invalid time format',
      };
    }

    const now = new Date();
    const delay = alarmTime.getTime() - now.getTime();

    // 检查时间是否已经过期
    if (delay <= 0) {
      return {
        success: false,
        message: `时间「${timeStr}」已经是过去时，请设置一个将来的时间`,
        error: 'Time is in the past',
      };
    }

    // 检查是否超过最大延迟（24小时）
    const maxDelay = 24 * 60 * 60 * 1000;
    if (delay > maxDelay) {
      return {
        success: false,
        message: '闹钟最多只能设置在 24 小时之内',
        error: 'Time too far in the future',
      };
    }

    // 生成闹钟 ID
    const alarmId = generateAlarmId();

    // 设置定时器
    const timeoutId = setTimeout(async () => {
      // 触发闹钟
      await triggerAlarm(alarmId, title, alarmTime);
    }, delay);

    // 存储闹钟
    const alarm: Alarm = {
      id: alarmId,
      title,
      time: alarmTime,
      timeoutId,
    };
    activeAlarms.set(alarmId, alarm);

    // 格式化显示时间
    const timeDisplay = formatTimeDisplay(alarmTime);

    logger.info(`[AlarmService] Alarm set: ${title} at ${alarmTime.toISOString()}, delay=${delay}ms`);

    return {
      success: true,
      message: `✅ 闹钟已设置：${title}\n⏰ 提醒时间：${timeDisplay}`,
      alarmId,
      scheduledTime: alarmTime.toISOString(),
    };
  } catch (error) {
    logger.error('[AlarmService] Failed to set alarm:', error);
    return {
      success: false,
      message: `设置闹钟失败：${error instanceof Error ? error.message : String(error)}`,
      error: String(error),
    };
  }
};

/**
 * 触发闹钟
 */
const triggerAlarm = async (alarmId: string, title: string, scheduledTime: Date): Promise<void> => {
  logger.info(`[AlarmService] Alarm triggered: ${title}`);

  // 移除闹钟
  activeAlarms.delete(alarmId);

  // 发送 macOS 系统通知
  await sendMacOSNotification('⏰ 闹钟提醒', `${title}\n提醒时间：${formatTimeDisplay(scheduledTime)}`);
};

/**
 * 格式化时间显示
 */
const formatTimeDisplay = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === date.toDateString();

  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `今天 ${timeStr}`;
  } else if (isTomorrow) {
    return `明天 ${timeStr}`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

/**
 * 取消闹钟
 * @param alarmId 闹钟 ID
 * @returns 是否成功取消
 */
export const cancelAlarm = (alarmId: string): boolean => {
  const alarm = activeAlarms.get(alarmId);
  if (!alarm) {
    return false;
  }

  // 清除定时器
  clearTimeout(alarm.timeoutId);

  // 移除闹钟
  activeAlarms.delete(alarmId);

  logger.info(`[AlarmService] Alarm cancelled: ${alarmId}`);
  return true;
};

/**
 * 获取所有活跃闹钟
 * @returns 闹钟列表
 */
export const getActiveAlarms = (): Array<{ id: string; title: string; time: string }> => {
  return Array.from(activeAlarms.values()).map((alarm) => ({
    id: alarm.id,
    title: alarm.title,
    time: formatTimeDisplay(alarm.time),
  }));
};

/**
 * 清除所有闹钟
 */
export const clearAllAlarms = (): void => {
  for (const alarm of activeAlarms.values()) {
    clearTimeout(alarm.timeoutId);
  }
  activeAlarms.clear();
  logger.info('[AlarmService] All alarms cleared');
};

export default {
  setAlarm,
  cancelAlarm,
  getActiveAlarms,
  clearAllAlarms,
};
