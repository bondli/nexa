import React, { memo, useEffect } from 'react';

type ComProps = {
  content: string;
  callback: () => void;
};

const Summarize: React.FC<ComProps> = (props) => {
  const { content, callback } = props;

  useEffect(() => {
    callback && callback();
  }, []);

  const output = content.replace(/<summarize>([\s\S]*?)<\/summarize>/g, '$1');

  return <div style={{ fontSize: 12, display: 'none' }}>{output}</div>;
};

export default memo(Summarize);
