import axios from 'axios';
import logger from 'electron-log';

/**
 * wttr.in 天气 API 响应结构
 */
interface WttrResponse {
  current_condition: Array<{
    temp_C: string;
    temp_F: string;
    humidity: string;
    wind_kph: string;
    wind_dir: string;
    weatherDesc: Array<{ value: string }>;
    observation_time: string;
  }>;
  nearest_area?: Array<{
    areaName: Array<{ value: string }>;
    country: Array<{ value: string }>;
  }>;
}

/**
 * 天气查询结果
 */
export interface WeatherResult {
  success: boolean;
  city?: string;
  temp?: string;
  feelsLike?: string;
  text?: string;
  humidity?: string;
  windDir?: string;
  windScale?: string;
  hourly?: string;
  error?: string;
}

/**
 * 查询天气
 * 使用 wttr.in API，无需 API Key
 * @param city 城市名称
 * @returns 天气结果
 */
export const getWeather = async (city: string): Promise<WeatherResult> => {
  try {
    logger.info(`[WeatherService] Querying weather for: ${city}`);

    const url = `https://wttr.in/${encodeURIComponent(city)}`;
    logger.info(`[WeatherService] Request URL: ${url}`);

    const response = await axios.get<WttrResponse>(url, {
      params: {
        format: 'j1',
      },
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });

    logger.info(`[WeatherService] Response status: ${response.status}`);
    logger.info(`[WeatherService] Response data:`, JSON.stringify(response.data).substring(0, 500));

    if (response.status !== 200) {
      logger.error('[WeatherService] HTTP error:', response.status);
      return {
        success: false,
        error: `天气查询失败，状态码：${response.status}`,
      };
    }

    const data = response.data;
    const current = data.current_condition?.[0];

    if (!current) {
      logger.error('[WeatherService] No current_condition in response');
      return {
        success: false,
        error: '天气数据解析失败',
      };
    }

    logger.info('[WeatherService] Weather data:', current);

    // 获取城市名称
    const areaName = data.nearest_area?.[0]?.areaName?.[0]?.value || city;

    return {
      success: true,
      city: areaName,
      temp: `${current.temp_C}°C`,
      feelsLike: `${current.temp_C}°C`,
      text: current.weatherDesc?.[0]?.value || '未知',
      humidity: `${current.humidity}%`,
      windDir: current.wind_dir,
      windScale: current.wind_kph,
    };
  } catch (error) {
    logger.error('[WeatherService] Weather query failed:', error);
    if (axios.isAxiosError(error)) {
      logger.error('[WeatherService] Axios error:', error.message, error.code, error.response?.status);
    }
    return {
      success: false,
      error: `天气查询失败：${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * 格式化天气结果为友好文本
 * @param result 天气查询结果
 * @returns 格式化后的文本
 */
export const formatWeatherResult = (result: WeatherResult): string => {
  if (!result.success) {
    return `查询天气失败：${result.error}`;
  }

  const parts: string[] = [];
  parts.push(`📍 ${result.city}当前天气`);
  parts.push(`🌡️ 温度：${result.temp}`);
  parts.push(`☁️ 天气：${result.text}`);
  parts.push(`💧 湿度：${result.humidity}`);
  parts.push(`🌬️ 风向：${result.windDir} ${result.windScale}km/h`);

  return parts.join('\n');
};

export default {
  getWeather,
  formatWeatherResult,
};
