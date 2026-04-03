import path from 'path';
import { app, BrowserWindow } from 'electron';
import logger from 'electron-log';
import { getTrayBounds } from './tray';

let quickNoteWindow: BrowserWindow | null = null;
let apiServerStatus = '';

const windowWidth = 400;
const windowHeight = 200;

/**
 * 设置 API 服务器状态
 * 需要在 main.ts 中调用以同步状态
 */
export const setQuickNoteApiStatus = (status: string): void => {
  apiServerStatus = status;
};

/**
 * 计算快速笔记窗口位置（托盘图标下方20px）
 */
const getQuickNotePosition = (): { x: number; y: number } | null => {
  const trayBounds = getTrayBounds();
  if (!trayBounds) return null;

  const offset = 20;

  // 窗口左上角坐标（居中于托盘图标）
  const x = Math.round(trayBounds.x - windowWidth / 2);
  const y = trayBounds.y + offset;

  return { x, y };
};

/**
 * 创建快速笔记窗口
 */
export const createQuickNoteWindow = (): void => {
  // 如果窗口已存在，聚焦并返回
  if (quickNoteWindow) {
    quickNoteWindow.focus();
    return;
  }

  logger.info('[Main Process] quick note window will be create');
  quickNoteWindow = new BrowserWindow({
    title: '快速笔记',
    width: windowWidth,
    height: windowHeight,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 设置窗口位置为托盘图标下方
  const position = getQuickNotePosition();
  if (position) {
    quickNoteWindow.setPosition(position.x, position.y);
  }

  const openWin = () => {
    if (!app.isPackaged) {
      quickNoteWindow.loadURL('http://localhost:3333/#/quick-note');
    } else {
      quickNoteWindow.loadFile('dist/index.html', { hash: '/quick-note' }).catch(() => null);
    }
    logger.info('[Main Process] quick note window is showed');
  };

  // 服务起来之后再打开界面
  if (apiServerStatus === 'success') {
    openWin();
  } else {
    let timer = 0;
    const t = setInterval(() => {
      timer++;
      if (apiServerStatus === 'success' || timer >= 50) {
        openWin();
        timer = 0;
        clearInterval(t);
      }
    }, 100);
  }

  // 关闭窗口时销毁引用
  quickNoteWindow.on('closed', () => {
    quickNoteWindow = null;
  });
};

/**
 * 关闭快速笔记窗口
 */
export const closeQuickNoteWindow = (): void => {
  if (quickNoteWindow) {
    quickNoteWindow.close();
    quickNoteWindow = null;
  }
};

/**
 * 获取快速笔记窗口
 */
export const getQuickNoteWindow = (): BrowserWindow | null => {
  return quickNoteWindow;
};
