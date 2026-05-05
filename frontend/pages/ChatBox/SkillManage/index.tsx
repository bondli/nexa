import React, { useState, useEffect } from 'react';
import { Button, Drawer, message, Space } from 'antd';
import { ToolOutlined, PlusOutlined, ExportOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { API_BASE_URL } from '@commons/constant';
import SkillList from './SkillList';
import AddSkillModal from './AddSkillModal';

interface Skill {
  id: number;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string | null;
  tags: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const SkillManage: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [skillList, setSkillList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 获取 Skills 列表
  const fetchSkillList = async () => {
    setLoading(true);
    try {
      const response = await request.get('/skill/list');
      setSkillList(response.data || []);
    } catch (error) {
      console.error('[SkillManage] 获取技能列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开 Drawer 时获取列表
  useEffect(() => {
    if (drawerVisible) {
      fetchSkillList();
    }
  }, [drawerVisible]);

  // 切换 Skill 启用/禁用
  const handleToggle = async (name: string, enabled: boolean) => {
    try {
      await request.put(`/skill/${name}/toggle`, { enabled });
      message.success(enabled ? 'Skill 已启用' : 'Skill 已禁用');
      fetchSkillList();
    } catch (error) {
      console.error('[SkillManage] 切换技能状态失败:', error);
    }
  };

  // 删除 Skill
  const handleDelete = async (name: string) => {
    try {
      await request.delete(`/skill/${name}`);
      message.success('Skill 已删除');
      fetchSkillList();
    } catch (error) {
      console.error('[SkillManage] 删除技能失败:', error);
    }
  };

  // 导出所有 Skills
  const handleExportAll = async () => {
    try {
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      const response = await fetch(`${API_BASE_URL}skill/export-all`, {
        method: 'GET',
        headers: {
          'X-User-Id': loginData.id || 0,
          'X-From': 'Nexa-App-Client',
        },
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexa-skills-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Skills 导出成功');
    } catch (error) {
      console.error('[SkillManage] 导出技能失败:', error);
      message.error('导出失败');
    }
  };

  // 添加成功后的回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    fetchSkillList();
  };

  return (
    <>
      {/* Skills 管理按钮 */}
      <Button
        type="default"
        size="large"
        style={{ width: '100%' }}
        icon={<ToolOutlined />}
        onClick={() => setDrawerVisible(true)}
      >
        Skills
      </Button>

      {/* Skills 管理 Drawer */}
      <Drawer
        title="Skills 管理"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        size={700}
        extra={
          <Space>
            <Button icon={<ExportOutlined />} onClick={handleExportAll}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
              添加
            </Button>
          </Space>
        }
      >
        <SkillList skills={skillList} loading={loading} onToggle={handleToggle} onDelete={handleDelete} />
      </Drawer>

      {/* 添加 Skill Modal */}
      <AddSkillModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onSuccess={handleAddSuccess} />
    </>
  );
};

export default SkillManage;
