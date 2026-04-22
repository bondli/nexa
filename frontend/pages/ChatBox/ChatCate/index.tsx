import React, { memo, useContext, useState } from 'react';
import { FolderOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { App, Input, Drawer, Popover, Button } from 'antd';
import request from '@commons/request';
import { ChatObject, ChatCateObject } from '../constant';
import { ChatBoxContext } from '../context';
import CateAction from './CateAction';
import CateDetail from './CateDetail';
import style from './index.module.less';

const ChatCate: React.FC = () => {
  const { message } = App.useApp();

  // 新增分组 Popover 状态
  const [isAddCateOpen, setIsAddCateOpen] = useState(false);
  const [newCateName, setNewCateName] = useState('');
  const addCateInputRef = React.useRef<InputRef>(null);

  // 分组详情 Modal 状态
  const [isCateModalOpen, setIsCateModalOpen] = useState(false);
  const [selectedCate, setSelectedCate] = useState<ChatCateObject | null>(null);
  const [cateChats, setCateChats] = useState<ChatObject[]>([]); // 当前选择的分类下的对话列表

  const { setCurrentChat, chatCates, getChatCateList } = useContext(ChatBoxContext);

  // 处理新增分组
  const handleAddCate = async () => {
    if (!newCateName.trim()) {
      message.warning('请输入分组名称');
      return;
    }
    const response = await request.post('/chat_cate/add', {
      name: newCateName.trim(),
    });
    if (response.code === 0) {
      getChatCateList();
      setIsAddCateOpen(false);
      setNewCateName('');
      message.success('分组创建成功');
    } else {
      message.error('创建失败，请稍后再试');
    }
  };

  // 新增分组 Popover 打开变化
  const handleAddCateOpenChange = (open: boolean) => {
    setIsAddCateOpen(open);
    if (!open) {
      setNewCateName('');
    } else {
      setTimeout(() => {
        addCateInputRef.current?.focus();
      }, 100);
    }
  };

  // 新增分组 - 输入框内容
  const createCateForm = (
    <div>
      <Input
        ref={addCateInputRef}
        placeholder="输入分组名称[最多10字符]"
        value={newCateName}
        onChange={(e) => setNewCateName(e.target.value)}
        onPressEnter={handleAddCate}
      />
      <div className={style.tips}>输入完后按下回车提交</div>
    </div>
  );

  // 分组删除和重命名成功的回调
  const onDeleteOrRenameSuccess = () => {
    getChatCateList();
  };

  // 加载分组下的对话
  const loadCateChats = async (cate: ChatCateObject) => {
    try {
      const response = await request.get(`/chat_cate/chats?id=${cate.id}`);
      if (response.code === 0) {
        setCateChats(response.data.chats || []);
      }
    } catch (error) {
      message.error('获取分组对话列表失败');
      console.error(error);
    }
  };

  // 获取分组内的对话
  const handleCateClick = async (cate: ChatCateObject) => {
    setSelectedCate(cate);
    setIsCateModalOpen(true);
    await loadCateChats(cate);
  };

  return (
    <>
      <div className={style.chatCateContainer}>
        <div className={style.cateTitleRow}>
          <span>对话分组</span>
          <Popover
            content={createCateForm}
            title="新建对话分组"
            trigger="click"
            open={isAddCateOpen}
            onOpenChange={handleAddCateOpenChange}
            placement="rightTop"
          >
            <Button type={`text`} size={`small`} icon={<PlusOutlined />} />
          </Popover>
        </div>

        {/* 分组列表 */}
        {chatCates && chatCates.length > 0 && (
          <div className={style.cateList}>
            {chatCates.map((cate) => (
              <div key={cate.id} className={style.cateItem}>
                <FolderOutlined style={{ fontSize: '16px' }} className={style.cateIcon} />
                <span className={style.cateName} onClick={() => handleCateClick(cate)}>
                  {cate.name}
                </span>
                <span className={style.cateCount}>({cate.counts})</span>
                <CateAction selectedCate={cate} onUpdated={onDeleteOrRenameSuccess} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分组详情 Modal */}
      <Drawer
        title={selectedCate?.name || '分组详情'}
        open={isCateModalOpen}
        onClose={() => {
          setIsCateModalOpen(false);
          setSelectedCate(null);
          setCateChats([]);
        }}
        footer={null}
        size={600}
        destroyOnHidden={true}
      >
        <CateDetail
          selectedCate={selectedCate}
          chatList={cateChats}
          onSelected={(chat) => {
            setCurrentChat(chat);
            setIsCateModalOpen(false);
          }}
          onUpdated={() => {
            getChatCateList();
            loadCateChats(selectedCate);
          }}
        />
      </Drawer>
    </>
  );
};

export default memo(ChatCate);
