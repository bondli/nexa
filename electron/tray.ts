import path from 'path';
import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';

let tray: Tray | null = null;

/**
 * 创建系统托盘
 */
export const createTray = (mainWindow: BrowserWindow): Tray => {
  // 根据平台选择图标
  const iconPath = path.join(
    __dirname,
    '/dist/icons/tray.png',
  );

  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  // 创建托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
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

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
      }
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
