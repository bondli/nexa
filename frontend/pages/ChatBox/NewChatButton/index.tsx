import React, { memo } from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Button } from 'antd';

type NewChatProps = {
  text: string;
  size: 'large' | 'middle' | 'small';
  type: 'default' | 'primary' | 'link' | 'text' | 'dashed';
  width: string;
  onlyIcon?: boolean;
  onClick: () => void;
};

const NewChatButton: React.FC<NewChatProps> = (props) => {
  const { text, size, type, width, onlyIcon, onClick } = props;

  return (
    <Button type={type} onClick={onClick} size={size} style={{ width: width }}>
      <MessageOutlined />
      {onlyIcon ? null : <span>{text}</span>}
    </Button>
  );
};

export default memo(NewChatButton);
