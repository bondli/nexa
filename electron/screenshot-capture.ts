import path from 'path';
import { app, BrowserWindow, clipboard, nativeImage } from 'electron';
import logger from 'electron-log';
import { getTrayBounds } from './tray';

let screenshotWindow: BrowserWindow | null = null;
let apiServerStatus = '';

const windowWidth = 500;
const windowHeight = 450;

/**
 * 设置 API 服务器状态
 */
export const setScreenshotApiStatus = (status: string): void => {
  apiServerStatus = status;
};

/**
 * 计算截图窗口位置（托盘图标下方20px）
 */
const getScreenshotPosition = (): { x: number; y: number } | null => {
  const trayBounds = getTrayBounds();
  if (!trayBounds) return null;

  const offset = 20;

  // 窗口左上角坐标（居中于托盘图标）
  const x = Math.round(trayBounds.x - windowWidth / 2);
  const y = trayBounds.y + offset;

  return { x, y };
};

/**
 * 从剪贴板读取图片
 */
export const getImageFromClipboard = (): string | null => {
  const image = clipboard.readImage();

  if (image.isEmpty()) {
    return null;
  }

  // 返回 PNG 格式的 Base64 数据
  return image.toPNG().toString('base64');
};

/**
 * 创建截图快存窗口
 */
export const createScreenshotCaptureWindow = (): void => {
  // 如果窗口已存在，聚焦并返回
  if (screenshotWindow) {
    screenshotWindow.focus();
    return;
  }

  logger.info('[Main Process] screenshot capture window will be create');
  screenshotWindow = new BrowserWindow({
    title: '截图快存',
    width: windowWidth,
    height: windowHeight,
    minHeight: 300,
    resizable: true,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
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
  const position = getScreenshotPosition();
  if (position) {
    screenshotWindow.setPosition(position.x, position.y);
  }

  const openWin = () => {
    if (!app.isPackaged) {
      screenshotWindow.loadURL('http://localhost:3333/#/screenshot-capture');
    } else {
      screenshotWindow.loadFile('dist/index.html', { hash: '/screenshot-capture' }).catch(() => null);
    }
    logger.info('[Main Process] screenshot capture window is showed');
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
  screenshotWindow.on('closed', () => {
    screenshotWindow = null;
  });
};

/**
 * 关闭截图快存窗口
 */
export const closeScreenshotCaptureWindow = (): void => {
  if (screenshotWindow) {
    screenshotWindow.close();
    screenshotWindow = null;
  }
};

/**
 * 获取截图快存窗口
 */
export const getScreenshotCaptureWindow = (): BrowserWindow | null => {
  return screenshotWindow;
};
