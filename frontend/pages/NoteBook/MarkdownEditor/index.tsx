import React, { useState, useEffect } from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import styles from './index.module.less';

// 自定义标题命令，使用较小的字体
const createHeadingCommand = (level: number): ICommand => {
  const baseCommand = level === 1 ? commands.title1 : level === 2 ? commands.title2 : commands.title3;
  return {
    ...baseCommand,
    icon: <div style={{ fontSize: 14, textAlign: 'left' }}>{level === 1 ? 'H1' : level === 2 ? 'H2' : 'H3'}</div>,
  };
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, onBlur }) => {
  const [internalValue, setInternalValue] = useState(value);

  // 当外部 value 变化时更新内部状态
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value || '');
    }
  }, [value]);

  // 处理内容变化
  const handleChange = (newValue?: string) => {
    const content = newValue || '';
    setInternalValue(content);
    onChange(content);
  };

  return (
    <div className={styles.container} data-color-mode="light" style={{ height: '100%' }}>
      <div className={styles.editorWrapper}>
        <MDEditor
          value={internalValue}
          onChange={handleChange}
          onBlur={onBlur}
          preview={`edit`}
          height="100%"
          hideToolbar={false}
          visibleDragbar={false}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.divider,
            createHeadingCommand(1),
            createHeadingCommand(2),
            createHeadingCommand(3),
            commands.divider,
            commands.quote,
            commands.code,
            commands.codeBlock,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.link,
            commands.image,
          ]}
          extraCommands={[commands.codeEdit, commands.codeLive, commands.codePreview]}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
