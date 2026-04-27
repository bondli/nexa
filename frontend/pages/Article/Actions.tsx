import React, { memo, useState, useContext } from 'react';
import {
  DeleteOutlined,
  UndoOutlined,
  DragOutlined,
  SettingOutlined,
  CopyOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
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
  const { cateList, isTrashCategory, isTempCategory } = useContext(ArticleContext);
  const { message } = App.useApp();
  const { selectedArticle, onUpdated } = props;

  const [showMovePanel, setShowMovePanel] = useState(false);
  const [moveToCateId, setMoveToCateId] = useState(0);

  // 添加到知识库相关状态
  const [showAddToKnowledgePanel, setShowAddToKnowledgePanel] = useState(false);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<number | undefined>(undefined);
  const [addingToKnowledge, setAddingToKnowledge] = useState(false);
  const [knowledgeList, setKnowledgeList] = useState<any[]>([]);

  // 临时文章复制链接
  const copyTempArticleLink = () => {
    const url = selectedArticle?.url;
    if (!url) {
      message.warning('该文章没有链接');
      return;
    }
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success('链接已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };

  // 临时文章删除（软删除）
  const deleteTempArticle = () => {
    userLog('Delete Temp Article: ', selectedArticle.id);
    request
      .get(`/temp_article/delete?id=${selectedArticle.id}`)
      .then(() => {
        message.success('该临时文章已删除');
        onUpdated();
      })
      .catch((err) => {
        userLog('Delete Temp Article Error: ', err);
        message.error(`删除临时文章失败：${err.message}`);
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

  // 点击添加到知识库 - 通过 API 获取知识库列表
  const handleAddToKnowledge = () => {
    request
      .get('/knowledge/list')
      .then((res) => {
        const list = res.data || [];
        setKnowledgeList(list);
        if (list.length === 0) {
          message.warning('暂无知识库，请先创建知识库');
          return;
        }
        setShowAddToKnowledgePanel(true);
        setSelectedKnowledgeId(undefined);
      })
      .catch((err) => {
        userLog('Fetch Knowledge List Error: ', err);
        message.error('获取知识库列表失败');
      });
  };

  // 取消添加到知识库
  const handleCancelAddToKnowledge = () => {
    setShowAddToKnowledgePanel(false);
    setSelectedKnowledgeId(undefined);
  };

  // 确认添加到知识库
  const handleConfirmAddToKnowledge = () => {
    if (!selectedKnowledgeId) {
      message.error('请先选择目标知识库');
      return;
    }
    userLog('Add Article to Knowledge: ', { articleId: selectedArticle.id, knowledgeId: selectedKnowledgeId });
    setAddingToKnowledge(true);
    request
      .get(`/knowledge/addToKnowledge?id=${selectedArticle.id}&knowledgeId=${selectedKnowledgeId}&type=article`)
      .then(() => {
        message.success('已添加到知识库');
        setShowAddToKnowledgePanel(false);
        setSelectedKnowledgeId(undefined);
      })
      .catch((err) => {
        userLog('Add Article to Knowledge Error: ', err);
        message.error(`添加到知识库失败：${err.message}`);
      })
      .finally(() => {
        setAddingToKnowledge(false);
      });
  };

  // 操作菜单
  const getMenus = (): MenuProps['items'] => {
    const menus = [];

    if (isTempCategory) {
      // 临时文章：显示复制链接和删除
      menus.push({
        key: 'copyLink',
        icon: <CopyOutlined />,
        label: '复制链接',
        onClick: copyTempArticleLink,
      });
      menus.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '彻底删除',
        onClick: deleteTempArticle,
      });
    } else if (isTrashCategory) {
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
      // 正常状态：显示删除、移动分类和添加到知识库
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
      menus.push({
        key: 'addToKnowledge',
        icon: <FileAddOutlined />,
        label: '添加到知识库',
        onClick: handleAddToKnowledge,
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

      <Modal
        title={`添加到知识库`}
        open={showAddToKnowledgePanel}
        onOk={handleConfirmAddToKnowledge}
        onCancel={handleCancelAddToKnowledge}
        confirmLoading={addingToKnowledge}
        destroyOnHidden={true}
      >
        <div style={{ paddingTop: '16px' }}>
          <span>请选择目标知识库：</span>
          <Select
            onChange={(v) => {
              setSelectedKnowledgeId(v);
            }}
            style={{ width: 200 }}
            value={selectedKnowledgeId}
            placeholder="选择知识库"
          >
            {knowledgeList.map((item: any) => {
              return (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </Modal>
    </>
  );
};

export default memo(Actions);
