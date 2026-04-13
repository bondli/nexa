import React, { memo, useState, useContext } from 'react';
import { DeleteOutlined, RollbackOutlined, EditOutlined, DragOutlined } from '@ant-design/icons';
import { Dropdown, Modal, App, Button, Input, Select } from 'antd';
import type { MenuProps } from 'antd';
import { PictureContext, Picture, PictureCate } from './context';

type ActionsProps = {
  picture: Picture;
  isTrash: boolean;
  onUpdated: () => void;
};

const Actions: React.FC<ActionsProps> = (props) => {
  const { picture, isTrash, onUpdated } = props;
  const { message, modal } = App.useApp();
  const { deletePicture, restorePicture, forceDeletePicture, updatePicture, movePicture, cateList, currentCate } =
    useContext(PictureContext);

  const [editingPicture, setEditingPicture] = useState<Picture | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetCateId, setTargetCateId] = useState<number | undefined>(undefined);

  // 编辑
  const handleEdit = () => {
    setEditingPicture(picture);
    setEditDesc(picture.description || '');
  };

  const handleEditOk = async () => {
    try {
      await updatePicture(editingPicture!.id, editDesc);
      message.success('修改成功');
      setEditingPicture(null);
      onUpdated();
    } catch (err) {
      message.error('修改失败');
      console.error(err);
    }
  };

  const handleEditCancel = () => {
    setEditingPicture(null);
  };

  // 删除到回收站
  const handleDelete = () => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这张图片吗？删除后可在回收站找回。',
      onOk: async () => {
        try {
          await deletePicture(picture.id);
          message.success('已移入回收站');
          onUpdated();
        } catch (err) {
          message.error('删除失败');
          console.error(err);
        }
      },
    });
  };

  // 从回收站恢复
  const handleRestore = () => {
    modal.confirm({
      title: '确认恢复',
      content: '确定要恢复这张图片吗？',
      onOk: async () => {
        try {
          await restorePicture(picture.id);
          message.success('恢复成功');
          onUpdated();
        } catch (err) {
          message.error('恢复失败');
          console.error(err);
        }
      },
    });
  };

  // 彻底删除
  const handleForceDelete = () => {
    modal.confirm({
      title: '确认彻底删除',
      content: '彻底删除后将无法恢复，确定要继续吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          await forceDeletePicture(picture.id);
          message.success('已彻底删除');
          onUpdated();
        } catch (err) {
          message.error('删除失败');
          console.error(err);
        }
      },
    });
  };

  // 移动分类
  const handleMove = () => {
    setTargetCateId(picture.categoryId || undefined);
    setShowMoveModal(true);
  };

  const handleMoveOk = async () => {
    if (targetCateId === undefined) {
      message.error('请选择目标分类');
      return;
    }
    if (targetCateId === picture.categoryId) {
      message.info('图片已经在该分类中');
      setShowMoveModal(false);
      return;
    }
    try {
      await movePicture(picture.id, targetCateId);
      message.success('移动成功');
      setShowMoveModal(false);
      onUpdated();
    } catch (err) {
      message.error('移动失败');
      console.error(err);
    }
  };

  const handleMoveCancel = () => {
    setShowMoveModal(false);
    setTargetCateId(undefined);
  };

  // 获取可选的分类列表（排除当前分类）
  const getAvailableCates = () => {
    return cateList.filter((cate: PictureCate) => cate.id !== currentCate?.id);
  };

  // 操作菜单
  const getMenus = (): MenuProps['items'] => {
    if (isTrash) {
      return [
        {
          key: 'restore',
          icon: <RollbackOutlined />,
          label: '恢复图片',
          onClick: handleRestore,
        },
        {
          key: 'forceDelete',
          icon: <DeleteOutlined />,
          label: '彻底删除',
          onClick: handleForceDelete,
        },
      ];
    }

    return [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑描述',
        onClick: handleEdit,
      },
      {
        key: 'move',
        icon: <DragOutlined />,
        label: '移动分类',
        onClick: handleMove,
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除图片',
        onClick: handleDelete,
      },
    ];
  };

  return (
    <>
      <Dropdown menu={{ items: getMenus() }} placement={`bottomRight`} trigger={['click']} arrow>
        <Button size="small" type="text" icon={<EditOutlined />} className="picture-action-btn" />
      </Dropdown>

      {/* 编辑描述弹窗 */}
      <Modal
        title="编辑描述"
        open={!!editingPicture}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
      >
        <Input.TextArea
          rows={3}
          placeholder="请输入图片描述"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          maxLength={200}
          style={{ marginBottom: 12 }}
          showCount
        />
      </Modal>

      {/* 移动分类弹窗 */}
      <Modal
        title="移动图片到分类"
        open={showMoveModal}
        onOk={handleMoveOk}
        onCancel={handleMoveCancel}
        okText="移动"
        cancelText="取消"
      >
        <div style={{ padding: '16px 0' }}>
          <span>选择目标分类：</span>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="请选择分类"
            value={targetCateId}
            onChange={(value) => setTargetCateId(value)}
            allowClear
          >
            {getAvailableCates().map((cate: PictureCate) => (
              <Select.Option key={cate.id} value={cate.id}>
                {cate.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
    </>
  );
};

export default memo(Actions);
