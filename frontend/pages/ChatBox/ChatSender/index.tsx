import { memo, useEffect, useState, useContext } from 'react';
import { Sender } from '@ant-design/x';
import { ChatBoxContext } from '../context';
import style from './index.module.less';

type ChatSenderProps = {
  handleSubmitMessage: (msg: string) => void;
};

const ChatSender: React.FC<ChatSenderProps> = (props) => {
  const { handleSubmitMessage } = props;
  const { messageProcessing, conversationId, abortController } = useContext(ChatBoxContext);

  const [inputValue, setInputValue] = useState('');

  // 提交消息
  const handleUserSubmit = async (msg: string) => {
    if (!msg.trim()) return;
    handleSubmitMessage(msg.trim());
  };

  useEffect(() => {
    setInputValue('');
  }, [conversationId]);

  return (
    <div className={style.container}>
      <Sender
        loading={messageProcessing}
        value={inputValue}
        onChange={(v) => {
          setInputValue(v);
        }}
        onSubmit={() => {
          handleUserSubmit(inputValue);
          setInputValue('');
        }}
        onCancel={() => {
          abortController.current?.abort();
        }}
        autoSize={{ minRows: 3, maxRows: 3 }}
        style={{ background: '#fff' }}
        allowSpeech
        placeholder={'Ask or input / use skills'}
        suffix={(_, info) => {
          const { SendButton, LoadingButton, SpeechButton } = info.components;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <SpeechButton className={style.speechButton} />
              {messageProcessing ? <LoadingButton type={'default'} /> : <SendButton type={'primary'} />}
            </div>
          );
        }}
      />
    </div>
  );
};

export default memo(ChatSender);
