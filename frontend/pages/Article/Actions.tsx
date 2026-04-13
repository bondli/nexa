import React, { memo, useState, useContext } from 'react';
import { DeleteOutlined, UndoOutlined, DragOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Modal, App, Select } from 'antd';
import type { MenuProps } from 'antd';
import request from '@commons/request';
import { ArticleContext } from './context';
import { userLog } from '@/commons/electron';

type ActionsProps = {
  selectedArticle: any;
  onUpdated: () => void;
};

const Actions: React.FC<ActionsProps> = (props) => {
  const { cateList, isTrashCategory } = useContext(ArticleContext);
  const { message } = App.useApp();
  const { selectedArticle, onUpdated } = props;

  const [showMovePanel, setShowMovePanel] = useState(false);
  const [moveToCateId, setMoveToCateId] = useState(0);

  // 点击移动
  const handleMove = () => {
    setShowMovePanel(true);
  };

  // 取消移动
  const handleCancelMove = () => {
    setShowMovePanel(false);
  };

  // 保存移动
  const handleSaveMove = () => {
    userLog('Save Move Article, new cate id: ', moveToCateId);
    if (!moveToCateId) {
      message.error('请先选择目标分类');
      return;
    }
    request
      .post(`/article/update`, {
        id: selectedArticle.id,
        cateId: moveToCateId,
        opType: 'move',
      })
      .then(() => {
        message.success('该文章已成功移动到目标分类');
        setShowMovePanel(false);
        setMoveToCateId(0);
        onUpdated();
      })
      .catch((err) => {
        userLog('Save Move Article Error: ', err);
        message.error(`移动文章失败：${err.message}`);
      });
  };

  // 删除文章到回收站
  const deleteArticle = () => {
    userLog('Delete Article: ', selectedArticle.id);
    request
      .get(`/article/delete?id=${selectedArticle.id}`)
      .then(() => {
        message.success('该文章已删除到回收站');
        onUpdated();
      })
      .catch((err) => {
        userLog('Delete Article Error: ', err);
        message.error(`删除文章失败：${err.message}`);
      });
  };

  // 从回收站恢复文章
  const recoverArticle = () => {
    userLog('Recover Article: ', selectedArticle.id);
    // 需要选择一个目标分类来恢复
    if (cateList.length === 0) {
      message.error('请先创建文章分类');
      return;
    }
    const defaultCateId = cateList.find((item: any) => !item.isVirtual)?.id;
    if (!defaultCateId) {
      message.error('请先创建文章分类');
      return;
    }
    request
      .get(`/article/recover?id=${selectedArticle.id}&cateId=${defaultCateId}`)
      .then(() => {
        message.success('该文章已恢复');
        onUpdated();
      })
      .catch((err) => {
        userLog('Recover Article Error: ', err);
        message.error(`恢复文章失败：${err.message}`);
      });
  };

  // 彻底删除文章
  const removeArticle = () => {
    userLog('Remove Article: ', selectedArticle.id);
    request
      .get(`/article/remove?id=${selectedArticle.id}`)
      .then(() => {
        message.success('该文章已彻底删除');
        onUpdated();
      })
      .catch((err) => {
        userLog('Remove Article Error: ', err);
        message.error(`彻底删除文章失败：${err.message}`);
      });
  };

  // 操作菜单
  const getMenus = (): MenuProps['items'] => {
    const menus = [];

    if (isTrashCategory) {
      // 回收站：显示恢复和彻底删除
      menus.push({
        key: 'recover',
        icon: <UndoOutlined />,
        label: '恢复文章',
        onClick: recoverArticle,
      });
      menus.push({
        key: 'remove',
        icon: <DeleteOutlined />,
        label: '彻底删除',
        onClick: removeArticle,
      });
    } else {
      // 正常状态：显示删除和移动分类
      menus.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除文章',
        onClick: deleteArticle,
      });
      menus.push({
        key: 'move',
        icon: <DragOutlined />,
        label: '移动分类',
        onClick: handleMove,
      });
    }

    return menus;
  };

  return (
    <>
      <Dropdown menu={{ items: getMenus() }} placement={`bottomRight`} trigger={['click']} arrow>
        <SettingOutlined style={{ color: '#71717a' }} />
      </Dropdown>

      <Modal
        title={`移动文章`}
        open={showMovePanel}
        onOk={handleSaveMove}
        onCancel={handleCancelMove}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <span>请选择目标分类：</span>
          <Select
            onChange={(v) => {
              setMoveToCateId(v);
            }}
            style={{ width: 160 }}
            value={moveToCateId || undefined}
          >
            {cateList
              .filter((item: any) => !item.isVirtual)
              .map((item: any) => {
                if (item.id !== selectedArticle.cateId) {
                  return (
                    <Select.Option value={item.id} key={item.id}>
                      {item.name}
                    </Select.Option>
                  );
                }
                return null;
              })}
          </Select>
        </div>
      </Modal>
    </>
  );
};

export default memo(Actions);
