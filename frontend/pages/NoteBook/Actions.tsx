import React, { memo, useState, useContext } from 'react';
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  UndoOutlined,
  RiseOutlined,
  DragOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Dropdown, Calendar, Modal, Radio, App, Select } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import request from '@commons/request';
import { NoteContext } from './context';
import { userLog } from '@/commons/electron';

type ActionsProps = {
  selectedNote: any;
  onUpdated: () => void;
};

const Actions: React.FC<ActionsProps> = (props) => {
  const { cateList } = useContext(NoteContext);
  const { message } = App.useApp();
  const { selectedNote, onUpdated } = props;

  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showPriorityPanel, setShowPriorityPanel] = useState(false);
  const [newPriority, setNewPriority] = useState(selectedNote.priority || 0);

  const [showMovePanel, setShowMovePanel] = useState(false);
  const [moveToCateId, setMoveToCateId] = useState(0);

  // 点击设置截止时间
  const handleTimePicker = () => {
    setShowTimePickerModal(true);
  };

  // 点击调整优先级
  const handlePriority = () => {
    setShowPriorityPanel(true);
  };

  // 取消调整优先级
  const handleCancelPriority = () => {
    setShowPriorityPanel(false);
  };

  // 暂选的优先级
  const handleSelectedPriority = (e) => {
    setNewPriority(e.target.value);
  };

  // 保存优先级
  const handleSavePriority = () => {
    userLog('Save Update Note Priority, new Priority: ', newPriority);
    if (!newPriority) {
      message.error('请先选择优先级');
      return;
    }
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        priority: newPriority,
        opType: 'updatePriority',
      })
      .then(() => {
        message.success('该笔记已更新优先级');
        setShowPriorityPanel(false);
        onUpdated();
      })
      .catch((err) => {
        userLog('Update Note Priority Error: ', err);
        message.error(`更新笔记优先级失败：${err.message}`);
      });
  };

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
    userLog('Save Move Note, new cate id: ', moveToCateId);
    if (!moveToCateId) {
      message.error('请先选择目标分类');
      return;
    }
    request
      .post(`/note/move?id=${selectedNote.id}&status=${selectedNote.status}`, {
        oldCateId: selectedNote.cateId,
        newCateId: moveToCateId,
      })
      .then(() => {
        message.success('该笔记已成功移动到目标笔记本分类');
        setShowMovePanel(false);
        setMoveToCateId(0);
        onUpdated();
      })
      .catch((err) => {
        userLog('Save Move Note Error: ', err);
        message.error(`移动笔记失败：${err.message}`);
      });
  };

  // 更新截止时间
  const onDateChange = (v) => {
    userLog('Update Note Deadline, new deadline: ', v);
    setShowTimePickerModal(false);
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        deadline: v,
        opType: 'updateDeadline',
      })
      .then(() => {
        message.success('该笔记已设置截止时间');
        onUpdated();
      })
      .catch((err) => {
        userLog('Update Note Deadline Error: ', err);
        message.error(`设置截止时间失败：${err.message}`);
      });
  };

  // 完成代办
  const updateToDone = () => {
    userLog('Update Note to done: ', selectedNote.id);
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        status: 'done',
        opType: 'done',
      })
      .then(() => {
        message.success('该代办已完成');
        onUpdated();
      })
      .catch((err) => {
        userLog('Update Note to done Error: ', err);
        message.error(`完成代办失败：${err.message}`);
      });
  };

  // 重做代办
  const updateFormDoneToUndo = () => {
    userLog('Update Note From done To Undo: ', selectedNote.id);
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        status: 'undo',
        opType: 'undo',
      })
      .then(() => {
        message.success('该代办事项已开启重做');
        onUpdated();
      })
      .catch((err) => {
        userLog('Update Note From done To Undo Error: ', err);
        message.error(`重启代办失败：${err.message}`);
      });
  };

  // 删除代办
  const updateToDeleted = () => {
    userLog('Delete Note: ', selectedNote.id);
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        status: 'deleted',
        opType: 'delete',
      })
      .then(() => {
        message.success('该笔记已删除');
        onUpdated();
      })
      .catch((err) => {
        userLog('Delete Note Error: ', err);
        message.error(`删除笔记失败：${err.message}`);
      });
  };

  // 从删除里面恢复
  const updateToUndo = () => {
    userLog('Restore Note: ', selectedNote.id);
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        status: 'undo',
        opType: 'restore',
      })
      .then(() => {
        message.success('该笔记已恢复');
        onUpdated();
      })
      .catch((err) => {
        userLog('Restore Note Error: ', err);
        message.error(`恢复笔记失败：${err.message}`);
      });
  };

  // 彻底删除
  const deletedFromTrash = () => {
    userLog('Delete Note From Trash: ', selectedNote.id);
    request
      .get(`/note/delete?id=${selectedNote.id}`)
      .then(() => {
        message.success('该笔记已彻底删除');
        onUpdated();
      })
      .catch((err) => {
        userLog('Delete Note From Trash Error: ', err);
        message.error(`彻底删除笔记失败：${err.message}`);
      });
  };

  // 操作菜单
  const getMenus = (): MenuProps['items'] => {
    const menus = [];
    // 完成(重做)代办事项
    if (selectedNote.status === 'undo') {
      menus.push({
        key: 'setDone',
        icon: <CheckCircleOutlined />,
        label: '完成代办',
        onClick: updateToDone,
      });
    } else {
      menus.push({
        key: 'setUndo',
        icon: <PlayCircleOutlined />,
        label: '重做代办',
        onClick: updateFormDoneToUndo,
      });
    }
    // 设置截止时间
    if (selectedNote.status === 'undo') {
      menus.push({
        key: 'setDeadline',
        icon: <ClockCircleOutlined />,
        label: '设置DDL',
        onClick: handleTimePicker,
      });
    } else {
      menus.push({
        key: 'setDeadline',
        icon: <ClockCircleOutlined />,
        label: '设置DDL',
        disabled: true,
      });
    }
    // 删除和恢复
    if (selectedNote.status === 'deleted') {
      menus.push({
        key: 'setRestore',
        icon: <UndoOutlined />,
        label: '恢复代办',
        onClick: updateToUndo,
      });
    } else {
      menus.push({
        key: 'setDelete',
        icon: <DeleteOutlined />,
        label: '删除代办',
        onClick: updateToDeleted,
      });
    }
    // 彻底删除和优先级设置，以及移动分类
    if (selectedNote.status === 'deleted') {
      menus.push({
        key: 'setNull',
        icon: <DeleteOutlined />,
        label: '彻底删除',
        onClick: deletedFromTrash,
      });
    } else {
      menus.push({
        key: 'setPriority',
        icon: <RiseOutlined />,
        label: '改优先级',
        onClick: handlePriority,
      });
      menus.push({
        key: 'moveTo',
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
        title={`更新笔记优先级`}
        open={showPriorityPanel}
        onOk={handleSavePriority}
        onCancel={handleCancelPriority}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <span>请选择优先级：</span>
          <Radio.Group buttonStyle={`solid`} onChange={handleSelectedPriority} defaultValue={selectedNote.priority}>
            <Radio.Button value={1}>P1</Radio.Button>
            <Radio.Button value={2}>P2</Radio.Button>
            <Radio.Button value={3}>P3</Radio.Button>
            <Radio.Button value={4}>P4</Radio.Button>
          </Radio.Group>
        </div>
      </Modal>

      <Modal
        title={`更新笔记截止时间`}
        open={showTimePickerModal}
        onOk={() => setShowTimePickerModal(false)}
        onCancel={() => setShowTimePickerModal(false)}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <Calendar
            fullscreen={false}
            onChange={onDateChange}
            disabledDate={(v) => {
              return v < dayjs().subtract(1, 'day');
            }}
          />
        </div>
      </Modal>

      <Modal
        title={`移动笔记`}
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
          >
            {cateList.map((item) => {
              if (item.id !== selectedNote.cateId) {
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
    </>
  );
};

export default memo(Actions);
