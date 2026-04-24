import React, { memo, useState, useEffect } from 'react';
import {
  GithubFilled,
  UserSwitchOutlined,
  RedoOutlined,
  SettingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { getThemeMode, setThemeMode, ThemeMode } from '@utils/theme';
import style from './index.module.less';

type UserProps = {
  info: any;
  hiddenText?: boolean;
  onLogout: () => void;
};

const User: React.FC<UserProps> = (props) => {
  const { info, hiddenText, onLogout } = props;
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('followSystem');

  // 初始化获取当前主题
  useEffect(() => {
    setCurrentTheme(getThemeMode());
  }, []);

  // 主题子菜单
  const themeSubMenu: MenuProps['items'] = [
    {
      key: 'theme-light',
      label: '浅色模式',
      icon: currentTheme === 'light' ? <CheckCircleOutlined /> : <div style={{ width: 14 }} />,
      onClick: () => handleThemeChange('light'),
    },
    {
      key: 'theme-dark',
      label: '深色模式',
      icon: currentTheme === 'dark' ? <CheckCircleOutlined /> : <div style={{ width: 14 }} />,
      onClick: () => handleThemeChange('dark'),
    },
    {
      key: 'theme-followSystem',
      label: '跟随系统',
      icon: currentTheme === 'followSystem' ? <CheckCircleOutlined /> : <div style={{ width: 14 }} />,
      onClick: () => handleThemeChange('followSystem'),
    },
  ];

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: info?.name,
      disabled: true,
      extra: (
        <RedoOutlined
          onClick={() => {
            window.location.reload();
          }}
        />
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'appearance',
      label: '外观设置',
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
      children: themeSubMenu,
    },
    {
      type: 'divider',
    },
    {
      label: '退出登录',
      key: 'logout',
      icon: <UserSwitchOutlined style={{ fontSize: '16px' }} />,
    },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    setCurrentTheme(mode);
    // 主题切换后刷新页面以应用新主题
    window.location.reload();
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const { key } = e;

    // 退出登录
    if (key === 'logout') {
      onLogout();
      return;
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <div className={style.container}>
      <Dropdown menu={menuProps} trigger={['click']}>
        <Space className={style.userInfoContainer}>
          <GithubFilled style={{ fontSize: '16px', verticalAlign: 'middle' }} />
          {hiddenText ? null : <div className={style.name}>{info?.name}</div>}
        </Space>
      </Dropdown>
    </div>
  );
};

export default memo(User);
