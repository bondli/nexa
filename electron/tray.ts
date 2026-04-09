import path from 'path';
import { app, Tray, Menu, nativeImage, BrowserWindow, screen } from 'electron';

let tray: Tray | null = null;
let mainWindowRef: BrowserWindow | null = null;
let recreateWindowCallback: (() => void) | null = null;

/**
 * 设置重新创建主窗口的回调
 */
export const setRecreateWindowCallback = (callback: () => void): void => {
  recreateWindowCallback = callback;
};

/**
 * 获取托盘实例
 */
export const getTray = (): Tray | null => {
  return tray;
};

/**
 * 获取托盘图标的屏幕位置
 */
export const getTrayBounds = (): { x: number; y: number } | null => {
  if (!tray) return null;

  const trayBounds = tray.getBounds();
  // 计算托盘图标中心位置
  const x = Math.round(trayBounds.x + trayBounds.width / 2);
  const y = trayBounds.y + trayBounds.height;

  return { x, y };
};

/**
 * 创建系统托盘
 * @param mainWindow 主窗口
 * @param onQuickNote 点击快速笔记时的回调函数
 * @param onScreenshotCapture 点击截图快存时的回调函数
 * @param closeAllPopups 关闭所有弹出窗口的回调
 */
export const createTray = (
  mainWindow: BrowserWindow,
  onQuickNote?: () => void,
  onScreenshotCapture?: () => void,
  closeAllPopups?: () => void,
): Tray => {
  // 如果托盘已存在，先销毁旧的
  if (tray) {
    tray.destroy();
  }

  mainWindowRef = mainWindow;
  // 根据平台选择图标
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icons', 'tray.png')
    : path.join(__dirname, '../../public/icons/tray.png');

  const icon = nativeImage.createFromPath(iconPath);
  // 设置为模板图片，让系统根据菜单栏背景色自动适配图标颜色
  icon.setTemplateImage(true);
  tray = new Tray(icon);

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '快速笔记',
      click: () => {
        // 先关闭所有弹出窗口
        if (closeAllPopups) {
          closeAllPopups();
        }
        // 调用快速笔记回调函数
        if (onQuickNote) {
          onQuickNote();
        }
      },
    },
    {
      label: '截图快存',
      click: () => {
        // 先关闭所有弹出窗口
        if (closeAllPopups) {
          closeAllPopups();
        }
        // 调用截图快存回调函数
        if (onScreenshotCapture) {
          onScreenshotCapture();
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Nexa');
  tray.setContextMenu(contextMenu);

  // 点击托盘图标显示窗口到最前面
  tray.on('click', () => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      if (mainWindowRef.isMinimized()) {
        mainWindowRef.restore();
      }
      mainWindowRef.show();
      mainWindowRef.focus();
    } else if (recreateWindowCallback) {
      // 窗口已销毁，重新创建
      recreateWindowCallback();
    }
  });

  return tray;
};

/**
 * 销毁系统托盘
 */
export const destroyTray = (): void => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
};
