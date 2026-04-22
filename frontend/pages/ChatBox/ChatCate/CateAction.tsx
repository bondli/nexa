import React, { memo, useState, useRef } from 'react';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { Dropdown, Modal, App, Input } from 'antd';
import type { MenuProps } from 'antd';
import request from '@commons/request';
import { userLog } from '@/commons/electron';

type ActionsProps = {
  selectedCate: any;
  onUpdated: () => void;
};

const Actions: React.FC<ActionsProps> = (props) => {
  const { message, modal } = App.useApp();
  const { selectedCate, onUpdated } = props;

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempCateName, setTempCateName] = useState('');

  const inputRef = useRef(null);

  // 删除分组
  const handleDelete = () => {
    userLog('Click Delete cate: ', selectedCate);
    modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，分组内的对话将变为未分组状态',
      onOk() {
        // 删除
        request
          .get(`/chat_cate/delete?id=${selectedCate?.id}`)
          .then(() => {
            userLog('Logic Delete cate: ', selectedCate);
            message.success('删除成功');
            onUpdated();
          })
          .catch((err) => {
            userLog('Logic Delete cate failed: ', err);
            message.error(`删除失败：${err.message}`);
          });
      },
    });
  };

  // 重命名
  const handleRename = () => {
    userLog('Click Edit Cate: ', selectedCate);
    setShowRenameModal(true);
    setTempCateName(selectedCate.name);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    }, 200);
  };

  const handleCateNameChange = (e) => {
    setTempCateName(e.target.value);
  };

  // 保存编辑信息
  const handleSaveEdit = () => {
    userLog('Submit Save Edit cate name, new cate name: ', tempCateName);
    if (!tempCateName || !tempCateName.length) {
      message.error('请输入对话分类名称');
      return;
    }
    request
      .post(`/chat_cate/update?id=${selectedCate?.id}`, {
        ...selectedCate,
        name: tempCateName,
      })
      .then(() => {
        setTempCateName('');
        setShowRenameModal(false);
        message.success(`修改成功`);
        onUpdated();
      })
      .catch((err) => {
        userLog('Logic Save Edit cate name failed: ', err);
        message.error(`修改失败：${err.message}`);
      });
  };

  // 操作菜单
  const getMenus = (): MenuProps['items'] => {
    const menus = [];
    menus.push({
      key: 'setRename',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: handleRename,
    });
    menus.push({
      key: 'setDelete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: handleDelete,
    });

    return menus;
  };

  return (
    <>
      <Dropdown menu={{ items: getMenus() }} placement={`bottomRight`} trigger={['click']} arrow>
        <MoreOutlined />
      </Dropdown>

      <Modal
        title={`重命名分组`}
        open={showRenameModal}
        onOk={() => {
          setShowRenameModal(false);
          handleSaveEdit();
        }}
        onCancel={() => setShowRenameModal(false)}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <Input
            value={tempCateName}
            onChange={handleCateNameChange}
            maxLength={8}
            allowClear
            ref={inputRef}
            onPressEnter={handleSaveEdit}
          />
        </div>
      </Modal>
    </>
  );
};

export default memo(Actions);
