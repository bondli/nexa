import React, { memo, useContext, useState, useRef } from 'react';
import {
  EllipsisOutlined,
  FormOutlined,
  DeleteOutlined,
  DragOutlined,
  ReloadOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Popover, Modal, Input, App, Space, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { API_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import { PictureContext } from './context';
import style from './index.module.less';

const Header: React.FC = () => {
  const { message, modal } = App.useApp();
  const { userInfo } = useContext(MainContext);
  const {
    currentCate,
    setCurrentCate,
    getCateList,
    getPictureList,
    updateCate,
    deleteCate,
    createPicture,
    searchPictureList,
  } = useContext(PictureContext);

  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [tempCateName, setTempCateName] = useState('');
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [tempCateOrder, setTempCateOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [searchKey, setSearchKey] = useState('');

  const inputRef = useRef(null);

  const isVirtual = !currentCate || currentCate.id === 0;

  // 搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) {
      getPictureList();
      return;
    }
    await searchPictureList(searchKey.trim());
  };

  // 编辑分类名称
  const handleEdit = () => {
    setShowActionModal(false);
    setShowEditPanel(true);
    setTempCateName(currentCate?.name || '');
    setTimeout(() => {
      inputRef?.current?.focus();
      (inputRef?.current as any)?.select?.();
    }, 200);
  };

  const handleCateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCateName(e.target.value);
  };

  const handleSaveEdit = () => {
    if (!tempCateName || !tempCateName.length) {
      message.error('请输入图片分类名称');
      return;
    }
    updateCate(currentCate.id, tempCateName)
      .then(() => {
        setTempCateName('');
        setShowEditPanel(false);
        setCurrentCate({ ...currentCate, name: tempCateName });
        message.success('修改成功');
      })
      .catch((err) => {
        message.error(`修改失败：${err.message}`);
      });
  };

  const handleCancelEdit = () => {
    setShowEditPanel(false);
  };

  // 删除分类
  const handleDelete = () => {
    setShowActionModal(false);
    modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，该分类下的图片将移至全部图片',
      onOk() {
        deleteCate(currentCate.id)
          .then(() => {
            setCurrentCate({ id: 0, name: '全部图片', counts: 0, orders: -1, userId: 0 });
            message.success('删除成功');
          })
          .catch((err) => {
            message.error(`删除失败：${err.message}`);
          });
      },
    });
  };

  // 调整排序
  const handleOrder = () => {
    setShowActionModal(false);
    setShowOrderPanel(true);
    setTempCateOrder(currentCate?.orders || 0);
  };

  const handleCateOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCateOrder(Number(e.target.value));
  };

  const handleSaveOrder = () => {
    if (!tempCateOrder) {
      message.error('请输入图片分类排序');
      return;
    }
    updateCate(currentCate.id, currentCate.name)
      .then(() => {
        setShowOrderPanel(false);
        setCurrentCate({ ...currentCate, orders: tempCateOrder });
        getCateList();
        message.success('排序成功');
      })
      .catch((err) => {
        message.error(`排序失败：${err.message}`);
      });
  };

  const handleCancelOrder = () => {
    setShowOrderPanel(false);
  };

  const handleMenuOpenChange = (open: boolean) => {
    setShowActionModal(open);
  };

  // 刷新图片列表
  const handleRefresh = () => {
    getPictureList();
  };

  // 上传图片配置
  const uploadConfig: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg',
    action: `${API_BASE_URL}common/uploadImage`,
    headers: {
      'X-User-Id': `${userInfo?.id || ''}`,
      'X-From': 'Nexa-App-Client',
    },
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return false;
      }
      setUploading(true);
      return true;
    },
    onChange: async (info) => {
      const { status } = info.file;
      if (status === 'done') {
        setUploading(false);
        const response = info.file.response;
        if (response && response.code === 0) {
          try {
            const urlPath = response.data?.url || response.data?.filePath || '';
            // 提取相对路径（去掉 host 部分）
            const relativePath = urlPath.replace(/^https?:\/\/[^/]+\//, '');
            await createPicture({
              path: relativePath,
              name: info.file.name,
              categoryId: isVirtual ? undefined : currentCate?.id,
            });
            message.success(`${info.file.name} 上传成功`);
          } catch (error) {
            message.error('图片记录创建失败');
          }
        } else {
          message.error(response?.message || '上传失败');
        }
      } else if (status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const actionMenu = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Button icon={<FormOutlined />} type={`text`} onClick={handleEdit} disabled={isVirtual}>
        编辑
      </Button>
      <Button icon={<DeleteOutlined />} type={`text`} onClick={handleDelete} disabled={isVirtual}>
        删除
      </Button>
      <Button icon={<DragOutlined />} type={`text`} onClick={handleOrder} disabled={isVirtual}>
        排序
      </Button>
      <Button icon={<ReloadOutlined />} type={`text`} onClick={handleRefresh}>
        刷新
      </Button>
    </div>
  );

  const cateName = currentCate?.id === 0 ? '全部图片' : currentCate?.name || '全部图片';

  return (
    <div className={style.pictureHeader}>
      <div className={style.title}>
        <span className={style.titleText}>{cateName}</span>
        <Popover
          content={actionMenu}
          trigger={`click`}
          open={showActionModal}
          onOpenChange={handleMenuOpenChange}
          placement={`bottom`}
        >
          <Button icon={<EllipsisOutlined />} type={`text`} />
        </Popover>
      </div>

      <Space>
        <Input
          style={{ width: 200 }}
          size={`small`}
          placeholder={`搜索图片名称`}
          prefix={<SearchOutlined />}
          allowClear
          value={searchKey}
          onChange={handleSearchChange}
          onPressEnter={handleSearch}
        />
        <Upload {...uploadConfig}>
          <Button type={`primary`} size={`small`} loading={uploading} icon={<UploadOutlined />}>
            上传图片
          </Button>
        </Upload>
      </Space>

      <Modal title={`修改图片分类`} open={showEditPanel} onOk={handleSaveEdit} onCancel={handleCancelEdit}>
        <Input
          value={tempCateName}
          onChange={handleCateNameChange}
          maxLength={8}
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
