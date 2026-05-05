import React from 'react';
import { List, Switch, Popconfirm, Button, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.less';

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

interface SkillListProps {
  skills: Skill[];
  loading: boolean;
  onToggle: (name: string, enabled: boolean) => void;
  onDelete: (name: string) => void;
}

const SkillList: React.FC<SkillListProps> = ({ skills, loading, onToggle, onDelete }) => {
  if (skills.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ant-color-text-secondary)' }}>
        暂无已安装的 Skills
        <br />
        <span style={{ fontSize: '12px' }}>点击右上角&quot;添加&quot;按钮安装新 Skill</span>
      </div>
    );
  }

  return (
    <List
      className={styles.skillList}
      loading={loading}
      dataSource={skills}
      renderItem={(skill) => (
        <List.Item
          actions={[
            <Switch
              key="toggle"
              size="small"
              checked={skill.enabled}
              onChange={(checked) => onToggle(skill.name, checked)}
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />,
            <Popconfirm
              key="delete"
              title="确定删除此 Skill？"
              description="删除后将从文件系统中移除，无法恢复"
              onConfirm={() => onDelete(skill.name)}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            title={
              <div className={styles.skillHeader}>
                <span className={styles.skillName}>{skill.name}</span>
                <div className={styles.skillMeta}>
                  <Tag color="blue" style={{ margin: 0 }}>
                    v{skill.version}
                  </Tag>
                  {skill.category && (
                    <Tag color="green" style={{ margin: 0 }}>
                      {skill.category}
                    </Tag>
                  )}
                </div>
              </div>
            }
            description={
              <>
                <div className={styles.skillDescription}>{skill.description}</div>
                <div className={styles.skillFooter}>
                  <span className={styles.skillAuthor}>{skill.author ? `by ${skill.author}` : ''}</span>
                </div>
                {skill.tags && skill.tags.length > 0 && (
                  <div className={styles.skillTags}>
                    {skill.tags.map((tag) => (
                      <Tag key={`tag-${tag}`}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default SkillList;
