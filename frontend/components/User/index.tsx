import React, { memo } from 'react';
import { GithubFilled, UserSwitchOutlined, RedoOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import style from './index.module.less';

type UserProps = {
  info: any;
  hiddenText?: boolean;
  onLogout: () => void;
};

const User: React.FC<UserProps> = (props) => {
  const { info, hiddenText, onLogout } = props;

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
      label: '退出登录',
      key: 'logout',
      icon: <UserSwitchOutlined style={{ fontSize: '16px' }} />,
    },
  ];
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
