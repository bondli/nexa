/**
 * 配置服务
 * 管理应用配置，包括主题设置
 */

import { getStore, setStore } from '@commons/electron';

export type ThemeMode = 'light' | 'dark' | 'followSystem';

// localStorage key for theme setting
const THEME_STORAGE_KEY = 'app_theme_mode';

/**
 * 获取当前主题设置
 * @returns 用户设置的主题模式，默认为 'followSystem'
 */
export const getThemeMode = (): ThemeMode => {
  const stored = getStore(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'followSystem') {
    return stored;
  }
  return 'followSystem';
};

/**
 * 设置主题模式
 * @param mode 主题模式
 */
export const setThemeMode = (mode: ThemeMode): void => {
  setStore(THEME_STORAGE_KEY, mode);
};

/**
 * 获取当前实际应用的主题（不是 followSystem）
 * @returns 'light' | 'dark'
 */
export const getResolvedTheme = (): 'light' | 'dark' => {
  const mode = getThemeMode();
  if (mode === 'followSystem') {
    // 检测系统主题
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
};

/**
 * 监听系统主题变化（用于 followSystem 模式）
 * @param callback 主题变化时的回调函数
 * @returns 取消监听函数
 */
export const watchSystemThemeChange = (callback: (isDark: boolean) => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handler);

  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};
