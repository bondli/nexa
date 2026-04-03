import path from 'path';
import { fork, type ChildProcess } from 'child_process';
import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import Store from 'electron-store';
import logger from 'electron-log';
import { createTray } from './tray';
import { createQuickNoteWindow, setQuickNoteApiStatus, closeQuickNoteWindow } from './quickNote';

// file position on macOS: ~/Library/Logs/{app name}/main.log
// file position on windows: C:\Users\Administrator\AppData\Roaming\{app name}\main.log
logger.transports.file.fileName = 'main.log';
logger.transports.file.level = 'info';
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
logger.transports.file.maxSize = 10 * 1024 * 1024; // 10MB，超过后自动归档

// 数据持久化
const store = new Store();

// 通过bridge的方式开放给渲染进程的功能
const initIpcRenderer = () => {
  ipcMain.on('setStore', (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.on('getStore', (_, key) => {
    const value = store.get(key);
    _.returnValue = value || '';
  });

  ipcMain.on('deleteStore', (_, key) => {
    store.delete(key);
    _.returnValue = '';
  });

  // 打日志
  ipcMain.on('userLog', (_, message) => {
    logger.info(message);
  });

  // 关闭快速笔记窗口
  ipcMain.on('close-quick-note', () => {
    closeQuickNoteWindow();
  });
};

// 定义ipcRenderer监听事件
initIpcRenderer();

// 启动ApiServer服务器
let apiServerStatus = '';
let apiServerChild: ChildProcess = null;
const startServer = (): void => {
  logger.info('[Main Process] API Server will be start');

  apiServerChild = fork(path.join(__dirname, '../', 'server', 'index'), [], {
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
    },
  });

  apiServerChild.on('error', (err) => {
    logger.info('[Main Process] API Server error:', err);
  });

  apiServerChild.on('message', (data) => {
    logger.info('[Main Process] API Server stdout: ', data);

    // 监听重启服务消息
    if (data === 'restart_server') {
      logger.info('[Main Process] Restarting API Server...');
      restartServer();
      return;
    }

    apiServerStatus = 'success';
    setQuickNoteApiStatus('success');
  });

  apiServerChild.on('exit', (code, signal) => {
    logger.info('[Main Process] API Server exit code: ', code);
    logger.info('[Main Process] API Server exit signal: ', signal);
  });

  apiServerChild.unref();
};

// 重启服务
const restartServer = (): void => {
  if (apiServerChild) {
    apiServerChild.kill();
    logger.info('[Main Process] Old API Server killed');
  }

  // 延迟重启，等待旧进程完全退出
  setTimeout(() => {
    apiServerStatus = '';
    setQuickNoteApiStatus('');
    startServer();
    logger.info('[Main Process] API Server restarted');
  }, 1000);
};

// on parent process exit, terminate child process too.
process.on('exit', () => {
  apiServerChild.kill();
});

let mainWindow: BrowserWindow | null = null;
/**
 * 创建主窗口
 */
const createWindow = () => {
  logger.info('[Main Process] main window will be create');
  mainWindow = new BrowserWindow({
    title: 'NEXA - AI Knowledge Manager',
    center: true,
    autoHideMenuBar: true,
    resizable: true,
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 720,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 禁用 nodeIntegration 以配合 contextIsolation
      contextIsolation: true, // 启用上下文隔离
    },
  });

  const openWin = () => {
    if (!app.isPackaged) {
      mainWindow.loadURL('http://localhost:3333/');
    } else {
      mainWindow.loadFile('dist/index.html').catch(() => null);
      mainWindow.setMenuBarVisibility(false); // 设置菜单栏不可见
      mainWindow.menuBarVisible = false;
    }
    logger.info('[Main Process] main window is showed');
  };

  // 服务起来之后再打开界面，否则出现加载不到数据，延迟100ms来检查
  if (apiServerStatus === 'success') {
    logger.info('[Main Process] server is startup before main window create');
    openWin();
  } else {
    let timer = 0;
    const t = setInterval(() => {
      timer++;
      // 5s之后服务还没有起来了，结束轮询，前台报错提示就好
      if (apiServerStatus === 'success' || timer >= 50) {
        openWin();
        timer = 0;
        clearInterval(t);
      }
    }, 100);
  }

  // 关闭 window 时触发下列事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建系统托盘，传入快速笔记窗口创建函数
  if (mainWindow) {
    createTray(mainWindow, createQuickNoteWindow);
  }
};

/**
 * 应用加载起来之后的任务
 */
app.whenReady().then(() => {
  logger.info('[Main Process] app is ready');
  if (!app.isPackaged) {
    globalShortcut.register('CommandOrControl+Alt+D', () => {
      mainWindow.webContents.isDevToolsOpened()
        ? mainWindow.webContents.closeDevTools()
        : mainWindow.webContents.openDevTools();
    });
  }

  startServer();

  createWindow();

  if (!mainWindow.isFocused()) {
    mainWindow.focus();
  }

  // 绑定 activate 方法，当 electron 应用激活时，创建一个窗口。这是为了点击关闭按钮之后从 dock 栏打开。
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // macOS 中点击 Dock 图标时没有已打开的其余应用窗口时，则通常在应用中重建一个窗口。
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 停止服务器
    apiServerChild.kill();
    app.quit();
  }
});

// 应用退出时停止服务器
app.on('before-quit', () => {
  apiServerChild.kill();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，将会聚焦到 mainWindow 这个窗口。
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainWindow.show();
    }
  });
}
