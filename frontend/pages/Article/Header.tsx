import React, { memo, useContext, useState, useRef } from 'react';
import { EllipsisOutlined, FormOutlined, DeleteOutlined, DragOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Popover, Modal, Input, App, Space } from 'antd';
import { userLog } from '@commons/electron';
import request from '@commons/request';
import { DEFAULT_CATE } from './constant';
import { ArticleContext } from './context';
import SearchBox from './SearchBox';
import style from './index.module.less';

const Header: React.FC = () => {
  const { message, modal } = App.useApp();
  const {
    currentCate,
    setCurrentCate,
    getArticleCateList,
    getArticleList,
    getArticleCounts,
    setSelectedArticle,
    isTempCategory,
    isTrashCategory,
  } = useContext(ArticleContext);

  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [tempCateName, setTempCateName] = useState('');

  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [tempCateOrder, setTempCateOrder] = useState(0);

  // 新建文章对话框
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleUrl, setNewArticleUrl] = useState('');

  const inputRef = useRef(null);

  // 点击新建文章按钮
  const handleNewArticleClick = () => {
    // 如果是虚拟分类需要先选择实体分类
    if (currentCate.isVirtual) {
      message.info('请先在左侧选择一个分类');
      return;
    }
    // 显示新建文章对话框
    setShowCreateModal(true);
    setNewArticleTitle('');
    setNewArticleUrl('');
  };

  // 确认创建文章
  const handleCreateArticle = () => {
    if (!newArticleTitle || !newArticleTitle.trim()) {
      message.error('请输入文章标题');
      return;
    }
    if (!newArticleUrl || !newArticleUrl.trim()) {
      message.error('请输入文章链接');
      return;
    }

    request
      .post('/article/add', {
        title: newArticleTitle.trim(),
        desc: '',
        url: newArticleUrl.trim(),
        cateId: currentCate.id,
      })
      .then((response) => {
        const articleData = response.data;
        userLog('Create Article: ', articleData);
        // 选中这个文章，用于打开编辑器
        setSelectedArticle(articleData);
        // 刷新统计
        getArticleCounts();
        // 重新拉取分类列表
        getArticleCateList();
        // 关闭对话框
        setShowCreateModal(false);
        setNewArticleTitle('');
        setNewArticleUrl('');
        message.success('创建成功');
      })
      .catch((err) => {
        userLog('Create Article Failed: ', currentCate);
        message.error(`创建失败：${err.message}`);
      });
  };

  // 取消创建文章
  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setNewArticleTitle('');
    setNewArticleUrl('');
  };

  // 编辑文章分类
  const handleEdit = () => {
    userLog('Click Edit Article Cate: ', currentCate);
    setShowActionModal(false);
    setShowEditPanel(true);
    setTempCateName(currentCate.name);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    }, 200);
  };

  const handleCateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCateName(e.target.value);
  };

  // 保存编辑信息
  const handleSaveEdit = () => {
    userLog('Submit Save Edit cate name, new cate name: ', tempCateName);
    if (!tempCateName || !tempCateName.length) {
      message.error('请输入文章分类名称');
      return;
    }
    request
      .post(`/article_cate/update?id=${currentCate?.id}`, {
        ...currentCate,
        name: tempCateName,
      })
      .then(() => {
        setTempCateName('');
        setShowEditPanel(false);
        setCurrentCate({ ...currentCate, name: tempCateName });
        getArticleCateList();
        message.success(`修改成功`);
      })
      .catch((err) => {
        userLog('Logic Save Edit cate name failed: ', err);
        message.error(`修改失败：${err.message}`);
      });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditPanel(false);
  };

  // 删除文章分类
  const handleDelete = () => {
    userLog('Click Delete cate: ', currentCate);
    setShowActionModal(false);
    modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，该分类下的文章全部清空',
      onOk() {
        request
          .get(`/article_cate/delete?id=${currentCate?.id}`)
          .then(() => {
            userLog('Logic Delete cate: ', currentCate);
            // 删除后，切换到默认分类
            setCurrentCate(DEFAULT_CATE);
            getArticleCateList();
            message.success('删除成功');
          })
          .catch((err) => {
            userLog('Logic Delete cate failed: ', err);
            message.error(`删除失败：${err.message}`);
          });
      },
    });
  };

  // 调整分类排序
  const handleOrder = () => {
    setShowActionModal(false);
    setShowOrderPanel(true);
    setTempCateOrder(currentCate?.orders || 0);
  };

  // 修改分类排序
  const handleCateOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCateOrder(Number(e.target.value));
  };

  // 保存分类排序
  const handleSaveOrder = () => {
    userLog('Submit Save Order cate, new cate order: ', tempCateOrder);
    if (!tempCateOrder) {
      message.error('请输入文章分类排序');
      return;
    }
    request
      .post(`/article_cate/update?id=${currentCate?.id}`, {
        ...currentCate,
        orders: tempCateOrder,
      })
      .then(() => {
        setShowOrderPanel(false);
        setCurrentCate({ ...currentCate, orders: tempCateOrder });
        getArticleCateList();
        message.success('排序成功');
      })
      .catch((err) => {
        userLog('Save Order cate failed: ', err);
        message.error(`排序失败：${err.message}`);
      });
  };

  // 取消修改分类排序
  const handleCancelOrder = () => {
    setShowOrderPanel(false);
  };

  const handleMenuOpenChange = (open: boolean) => {
    setShowActionModal(open);
  };

  // 刷新文章列表
  const handleRefresh = () => {
    getArticleList();
  };

  // 操作菜单
  const actionMenu = () => {
    const disabled = currentCate.isVirtual ? true : false;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Button icon={<FormOutlined />} type={`text`} onClick={handleEdit} disabled={disabled}>
          编辑
        </Button>
        <Button icon={<DeleteOutlined />} type={`text`} onClick={handleDelete} disabled={disabled}>
          删除
        </Button>
        <Button icon={<DragOutlined />} type={`text`} onClick={handleOrder} disabled={disabled}>
          排序
        </Button>
        <Button icon={<ReloadOutlined />} type={`text`} onClick={handleRefresh}>
          刷新
        </Button>
      </div>
    );
  };

  // 获取标题文本
  const getTitleText = () => {
    return currentCate.name;
  };

  // 判断是否显示新建按钮（临时文章和回收站不显示）
  const showCreateButton = !isTempCategory && !isTrashCategory;

  return (
    <div className={style.noteHeader}>
      <div className={style.title}>
        <span className={style.titleText}>{getTitleText()}</span>
        <Popover
          content={actionMenu}
          trigger={`click`}
          open={showActionModal}
          onOpenChange={handleMenuOpenChange}
          placement={`bottom`}
        >
          <Button icon={<EllipsisOutlined />} type={`text`}></Button>
        </Popover>
      </div>
      <Space>
        <SearchBox />
        {showCreateButton && (
          <Button type={`primary`} size={`small`} onClick={handleNewArticleClick}>
            新建文章
          </Button>
        )}
      </Space>

      {/* 新建文章对话框 */}
      <Modal
        title="新建文章"
        open={showCreateModal}
        onOk={handleCreateArticle}
        onCancel={handleCancelCreate}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: 'red' }}>* </span>
            <span>文章标题：</span>
            <Input
              placeholder="请输入文章标题"
              value={newArticleTitle}
              onChange={(e) => setNewArticleTitle(e.target.value)}
              style={{ marginTop: 8 }}
              maxLength={50}
            />
          </div>
          <div>
            <span style={{ color: 'red' }}>* </span>
            <span>文章链接：</span>
            <Input
              placeholder="请输入文章链接（URL）"
              value={newArticleUrl}
              onChange={(e) => setNewArticleUrl(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </Modal>

      <Modal title={`修改文章分类`} open={showEditPanel} onOk={handleSaveEdit} onCancel={handleCancelEdit}>
        <Input
          value={tempCateName}
          onChange={handleCateNameChange}
          maxLength={16}
          allowClear
          ref={inputRef}
          onPressEnter={handleSaveEdit}
        />
      </Modal>

      <Modal title={`调整分类排序`} open={showOrderPanel} onOk={handleSaveOrder} onCancel={handleCancelOrder}>
        <Input
          value={tempCateOrder}
          onChange={handleCateOrderChange}
          maxLength={2}
          allowClear
          onPressEnter={handleSaveOrder}
        />
      </Modal>
    </div>
  );
};

export default memo(Header);
