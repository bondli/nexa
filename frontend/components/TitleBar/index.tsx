/**
 * 自定义标题栏组件
 * macOS 上使用 hidden titleBarStyle，通过此组件模拟标题栏
 */

import React, { memo, useState, useEffect } from 'react';
import { getThemeMode, getResolvedTheme, watchSystemThemeChange } from '@utils/theme';
import style from './index.module.less';

const TitleBar: React.FC = () => {
  const [isDark, setIsDark] = useState(() => getResolvedTheme() === 'dark');

  useEffect(() => {
    // 获取当前主题状态
    const updateTheme = () => {
      const mode = getThemeMode();
      if (mode === 'followSystem') {
        setIsDark(getResolvedTheme() === 'dark');
      } else {
        setIsDark(mode === 'dark');
      }
    };

    // 初始更新
    updateTheme();

    // 监听系统主题变化（用于 followSystem 模式）
    const unwatch = watchSystemThemeChange((dark) => {
      if (getThemeMode() === 'followSystem') {
        setIsDark(dark);
      }
    });

    // 监听 localStorage 变化（主题切换时存储会更新）
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'app_theme_mode') {
        updateTheme();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unwatch();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className={`${style.titleBar} ${isDark ? style.dark : style.light}`}>
      <div className={style.dragRegion}>
        <span className={style.title}>NEXA</span>
      </div>
    </div>
  );
};

export default memo(TitleBar);
