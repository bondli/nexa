import React, { memo, useContext, useState, useEffect } from 'react';
import { FileDoneOutlined, HistoryOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { GetProp } from 'antd';
import { App, Empty, Input, Modal } from 'antd';
import type { ConversationsProps } from '@ant-design/x';
import { Conversations } from '@ant-design/x';
import request from '@commons/request';
import { ChatObject } from '../constant';
import { ChatBoxContext } from '../context';
import style from './index.module.less';

type ChatHistoryProps = {
  collapsed?: boolean;
};

const ChatHistory: React.FC<ChatHistoryProps> = (props) => {
  const { collapsed } = props;
  const { message, modal } = App.useApp();
  const [renameText, setRenameText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operateSessionId, setOperateSessionId] = useState('');

  const { currentChat, setCurrentChat, chatList, getChatList } = useContext(ChatBoxContext);

  // 会话菜单
  const [items, setItems] = useState([]);

  // 会话有值的时候构建菜单
  useEffect(() => {
    const menusTemp: GetProp<ConversationsProps, 'items'> = [];
    if (chatList && chatList.length) {
      chatList.forEach((item) => {
        menusTemp.push({
          label: item.title,
          key: item.sessionId,
          icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
        });
      });
      setItems(menusTemp);
    }
  }, [chatList]);

  // 获取会话列表
  useEffect(() => {
    getChatList();
  }, []);

  // 选中一个会话
  const handleChatSelect = (key) => {
    chatList.forEach((item) => {
      if (item.sessionId == key && item.sessionId !== currentChat?.sessionId) {
        setCurrentChat(item as ChatObject);
      }
    });
  };

  // 删除会话
  const handleDeleteConversation = async (sessionId: string) => {
    const response = await request.post('/chat/delete', {
      sessionId,
    });
    if (response.status === 200) {
      getChatList();
      // todo: 删除之后选择第一个
      setCurrentChat(null);
      message.success('该会话成功被删除了');
    } else {
      message.error('删除失败，请稍后再试');
    }
  };

  // 重命名会话
  const handleRenameConversation = async (sessionId: string, title: string) => {
    const response = await request.post('/chat/update', {
      sessionId,
      title,
    });
    if (response.status === 200) {
      getChatList();
      setIsModalOpen(false);
    } else {
      message.error('改名失败，请稍后再试');
    }
  };

  const menuConfig: ConversationsProps['menu'] = (conversation) => ({
    items: [
      {
        label: '编辑',
        key: 'rename',
        icon: <EditOutlined />,
      },
      {
        label: '删除',
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      menuInfo.domEvent.preventDefault();
      const sessionId = conversation.key;
      if (menuInfo.key === 'delete') {
        modal.confirm({
          title: '删除会话',
          content: '确定删除该会话吗？',
          onOk: () => {
            handleDeleteConversation(sessionId);
          },
        });
      } else if (menuInfo.key === 'rename') {
        const initRenameText = chatList?.find((item) => item.sessionId === sessionId)?.title || '';
        setRenameText(initRenameText);
        setOperateSessionId(sessionId);
        setIsModalOpen(true);
      }
    },
  });

  return (
    <>
      <div className={style.chatTitleContainer} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <HistoryOutlined />
        {collapsed ? null : <span style={{ paddingLeft: '4px' }}>Historys</span>}
      </div>
      {
        // 收拢的时候不展示会话列表
        collapsed ? null : (
          <div className={style.chatListContainer}>
            {chatList && chatList.length ? (
              <Conversations
                defaultActiveKey={''}
                activeKey={currentChat?.sessionId}
                menu={collapsed ? null : menuConfig}
                items={items}
                onActiveChange={handleChatSelect}
                className={style.list}
              />
            ) : collapsed ? null : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'no data'} />
            )}
          </div>
        )
      }

      <Modal
        title="重命名会话"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => handleRenameConversation(operateSessionId, renameText)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          placeholder="请输入新的会话名称"
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          onPressEnter={() => handleRenameConversation(operateSessionId, renameText)}
        />
      </Modal>
    </>
  );
};

export default memo(ChatHistory);
