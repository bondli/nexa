import React, { memo, useContext, useState } from 'react';
import { FileDoneOutlined, EditOutlined, DragOutlined, DeleteOutlined } from '@ant-design/icons';
import type { GetProp } from 'antd';
import { App, Empty, Input, Modal, Select } from 'antd';
import type { ConversationsProps } from '@ant-design/x';
import { Conversations } from '@ant-design/x';
import request from '@commons/request';
import { ChatObject, ChatCateObject } from '../constant';
import { ChatBoxContext } from '../context';
import style from './index.module.less';

type CateDetailProps = {
  selectedCate: ChatCateObject | null;
  chatList: ChatObject[];
  onSelected?: (chat: ChatObject) => void;
  onUpdated?: () => void;
};

const CateDetail: React.FC<CateDetailProps> = (props) => {
  const { message, modal } = App.useApp();
  const { selectedCate, chatList, onSelected, onUpdated } = props;

  const { currentChat, setCurrentChat, chatCates } = useContext(ChatBoxContext);

  const [renameText, setRenameText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operateSessionId, setOperateSessionId] = useState('');

  const [showMovePanel, setShowMovePanel] = useState(false);
  const [moveToCateId, setMoveToCateId] = useState(0);

  // 构建对话菜单项
  const buildConversationItems = (chats: ChatObject[]): GetProp<ConversationsProps, 'items'> => {
    return chats.map((item) => ({
      label: item.title,
      key: item.sessionId,
      icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
    }));
  };

  // 选中一个对话
  const handleChatSelect = (key) => {
    chatList.forEach((item) => {
      if (item.sessionId == key && item.sessionId !== currentChat?.sessionId) {
        onSelected(item as ChatObject);
      }
    });
  };

  // 删除对话
  const handleDeleteConversation = async (sessionId: string) => {
    const response = await request.post('/chat/delete', {
      sessionId,
    });
    if (response.code === 0) {
      message.success('该对话成功被删除了');
      onUpdated();
    } else {
      message.error('删除失败，请稍后再试');
    }
  };

  // 重命名对话
  const handleRenameConversation = async (sessionId: string, title: string) => {
    const response = await request.post('/chat/update', {
      sessionId,
      title,
    });
    if (response.code === 0) {
      setIsModalOpen(false);
      onUpdated();
    } else {
      message.error('改名失败，请稍后再试');
    }
  };

  // 保存移动
  const handleSaveMove = async () => {
    console.log('Save Move Chat, new cate id: ', moveToCateId);
    if (!moveToCateId) {
      message.error('请先选择目标分类');
      return;
    }
    const response = await request.post('/chat/move_to_cate', {
      sessionId: operateSessionId,
      cateId: moveToCateId,
    });
    if (response.code === 0) {
      message.success('移动成功');
      // 如果当前选中的对话和操作的对话相同，需要将当前选中的对话清掉
      if (operateSessionId === currentChat?.sessionId) {
        setCurrentChat(null);
      }
      onUpdated();
    } else {
      message.error('移动失败，请稍后再试');
    }
  };

  // 对话菜单
  const menuConfig: ConversationsProps['menu'] = (conversation) => ({
    items: [
      {
        label: '重命名',
        key: 'rename',
        icon: <EditOutlined />,
      },
      {
        label: '移动到',
        key: 'move',
        icon: <DragOutlined />,
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
          title: '删除对话',
          content: '确定删除该对话吗？',
          onOk: () => {
            handleDeleteConversation(sessionId);
          },
        });
      } else if (menuInfo.key === 'rename') {
        const initRenameText = chatList?.find((item) => item.sessionId === sessionId)?.title || '';
        setRenameText(initRenameText);
        setOperateSessionId(sessionId);
        setIsModalOpen(true);
      } else if (menuInfo.key === 'move') {
        setOperateSessionId(sessionId);
        setShowMovePanel(true);
      }
    },
  });

  return (
    <div className={style.chatListContainer}>
      {chatList && chatList.length ? (
        <Conversations
          defaultActiveKey={''}
          activeKey={currentChat?.sessionId}
          menu={menuConfig}
          items={buildConversationItems(chatList)}
          onActiveChange={handleChatSelect}
          className={style.list}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无对话'} />
      )}

      <Modal
        title="重命名对话"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => handleRenameConversation(operateSessionId, renameText)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          placeholder="请输入新的的对话名称"
          value={renameText}
          onChange={(e) => setRenameText(e.target.value)}
          onPressEnter={() => handleRenameConversation(operateSessionId, renameText)}
        />
      </Modal>

      <Modal
        title={`移动对话`}
        open={showMovePanel}
        onOk={() => {
          setShowMovePanel(false);
          handleSaveMove();
        }}
        onCancel={() => setShowMovePanel(false)}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <span>请选择目标分类：</span>
          <Select
            onChange={(v) => {
              setMoveToCateId(v);
            }}
            style={{ width: 160 }}
          >
            {chatCates.map((item) => {
              if (item.id !== selectedCate?.id) {
                return (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                );
              }
            })}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default memo(CateDetail);
