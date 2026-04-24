import { memo, useEffect, useState, useContext } from 'react';
import { Sender } from '@ant-design/x';
import { Button, Dropdown, Space } from 'antd';
import { DatabaseOutlined, CheckOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { ChatBoxContext } from '../context';
import style from './index.module.less';

type KnowledgeItem = {
  id: number;
  name: string;
  description?: string;
  counts?: number;
};

type ChatSenderProps = {
  handleSubmitMessage: (msg: string, action?: string) => void;
};

const ChatSender: React.FC<ChatSenderProps> = (props) => {
  const { handleSubmitMessage } = props;
  const { messageProcessing, conversationId, abortController, selectedKnowledgeIds, setSelectedKnowledgeIds } =
    useContext(ChatBoxContext);

  const [inputValue, setInputValue] = useState('');
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);

  // 获取知识库列表
  useEffect(() => {
    const loadKnowledgeList = async () => {
      try {
        const response = await request.get('/knowledge/list');
        setKnowledgeList(response.data || []);
      } catch (error) {
        console.error('加载知识库列表失败:', error);
      }
    };
    loadKnowledgeList();
  }, []);

  useEffect(() => {
    setInputValue('');
  }, [conversationId]);

  // 提交消息
  const handleUserSubmit = async (msg: string) => {
    if (!msg.trim()) return;
    handleSubmitMessage(msg.trim());
  };

  // 知识库下拉菜单项
  const knowledgeMenuItems = knowledgeList.map((item) => ({
    key: item.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
        <div>
          {selectedKnowledgeIds.includes(item.id) ? (
            <CheckOutlined style={{ fontSize: 10 }} />
          ) : (
            <div style={{ width: 10 }}></div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14 }}>{item.name}</div>
        </div>
      </div>
    ),
  }));

  // 知识库下拉菜单点击处理
  const handleKnowledgeMenuClick = ({ key }: { key: string }) => {
    const id = Number(key);
    if (selectedKnowledgeIds.includes(id)) {
      setSelectedKnowledgeIds(selectedKnowledgeIds.filter((k) => k !== id));
    } else {
      setSelectedKnowledgeIds([...selectedKnowledgeIds, id]);
    }
  };

  // 按钮点击：如果已选中知识库，则清空；否则打开下拉菜单
  const handleButtonClick = () => {
    if (selectedKnowledgeIds.length > 0) {
      setSelectedKnowledgeIds([]);
    }
  };

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
        allowSpeech
        placeholder="Ask or input / use skills"
        suffix={(_, info) => {
          const { SendButton, LoadingButton, SpeechButton } = info.components;
          return (
            <Space size={4}>
              {knowledgeList.length > 0 && (
                <Dropdown
                  menu={{
                    items: knowledgeMenuItems,
                    onClick: handleKnowledgeMenuClick,
                    selectedKeys: selectedKnowledgeIds.map(String),
                    selectable: true,
                    multiple: true,
                  }}
                  trigger={['click']}
                  placement="topLeft"
                >
                  <Button
                    type={selectedKnowledgeIds.length > 0 ? 'primary' : 'text'}
                    size="small"
                    icon={<DatabaseOutlined />}
                    onClick={selectedKnowledgeIds.length > 0 ? handleButtonClick : undefined}
                  >
                    {selectedKnowledgeIds.length > 0 ? `已选知识库(${selectedKnowledgeIds.length})` : '开启知识库'}
                  </Button>
                </Dropdown>
              )}
              <SpeechButton />
              {messageProcessing ? <LoadingButton /> : <SendButton type="primary" />}
            </Space>
          );
        }}
      />
    </div>
  );
};

export default memo(ChatSender);
