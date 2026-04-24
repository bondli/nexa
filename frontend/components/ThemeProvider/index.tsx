/**
 * 主题切换 Provider
 * 使用 Ant Design ConfigProvider 实现主题切换
 */

import React, { memo, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { getThemeMode, getResolvedTheme, watchSystemThemeChange, ThemeMode } from '@utils/theme';

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
  const { children } = props;
  const [themeMode, setThemeMode] = useState<ThemeMode>('followSystem');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getResolvedTheme);

  // 判断是否为暗色模式
  const isDark = resolvedTheme === 'dark';

  // 初始化主题
  useEffect(() => {
    const mode = getThemeMode();
    setThemeMode(mode);
    setResolvedTheme(mode === 'followSystem' ? getResolvedTheme() : mode);
  }, []);

  // 监听系统主题变化（仅在 followSystem 模式下）
  useEffect(() => {
    if (themeMode !== 'followSystem') {
      return;
    }

    const unwatch = watchSystemThemeChange((isDark) => {
      setResolvedTheme(isDark ? 'dark' : 'light');
    });

    return unwatch;
  }, [themeMode]);

  // 主题变化时通知 Electron 主进程更新窗口背景色（macOS 标题栏）
  useEffect(() => {
    const win: any = window;
    if (win.electron?.ipcRenderer?.setWindowBackgroundColor) {
      win.electron.ipcRenderer.setWindowBackgroundColor(isDark);
    }
  }, [isDark]);

  // Ant Design 主题配置
  const antdThemeConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // 主色调：深色模式用白色，浅色模式用黑色
      colorPrimary: isDark ? '#ffffff' : '#18181b',
      // 圆角
      borderRadius: 6,
    },
    components: {
      Button: {
        primaryShadow: '0',
        contentFontSizeSM: 12,
        // Primary 按钮配置
        colorPrimary: isDark ? '#ffffff' : '#18181b',
        colorPrimaryHover: isDark ? '#f5f5f5' : '#27272a',
        colorPrimaryActive: isDark ? '#e5e5e5' : '#09090b',
        // Primary 按钮的文字颜色
        colorTextLightSolid: isDark ? '#18181b' : '#ffffff',
        // Default 按钮边框配置
        defaultBorderColor: isDark ? '#3f3f46' : '#d9d9d9',
        colorBorderSecondary: isDark ? '#3f3f46' : '#d9d9d9',
        defaultColor: isDark ? '#e4e4e7' : undefined,
        defaultBg: isDark ? 'transparent' : undefined,
        defaultHoverBorderColor: isDark ? '#52525b' : '#18181b',
        defaultHoverColor: isDark ? '#ffffff' : undefined,
        defaultHoverBg: isDark ? '#27272a' : undefined,
        defaultActiveBorderColor: isDark ? '#3f3f46' : '#096dd9',
        defaultActiveColor: isDark ? '#ffffff' : undefined,
        defaultActiveBg: isDark ? '#18181b' : undefined,
      },
      Menu: {
        itemHeight: 36,
        itemSelectedColor: isDark ? '#18181b' : '#ffffff',
        itemSelectedBg: isDark ? '#ffffff' : '#18181b',
      },
    },
  };

  return <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>;
};

export default memo(ThemeProvider);

// 导出主题模式类型供外部使用
export type { ThemeMode };
