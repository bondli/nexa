import React, { memo, useState } from 'react';
import { Button, Drawer } from 'antd';
import { RightOutlined } from '@ant-design/icons';

type ComProps = {
  content: string;
};

const Think: React.FC<ComProps> = (props) => {
  const { content } = props;
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
  };

  const output = content.replace(/<think>([\s\S]*?)<\/think>/g, '$1');

  if (!output.trim()) {
    return null;
  }

  return (
    <div style={{ fontSize: 12, marginBottom: 10 }}>
      <Button
        color="default"
        variant="filled"
        size="small"
        icon={<RightOutlined />}
        iconPosition="end"
        onClick={handleToggle}
        style={{ marginBottom: 5 }}
      >
        深度思考
      </Button>
      <Drawer
        title={`深度思考`}
        placement={'right'}
        onClose={handleToggle}
        open={collapsed}
        width={500}
        destroyOnHidden={true}
      >
        <div>{output}</div>
      </Drawer>
    </div>
  );
};

export default memo(Think);
