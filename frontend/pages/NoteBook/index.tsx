import React, { memo, useState, useEffect, useContext } from 'react';
import { Drawer, Layout } from 'antd';
import { NoteContext, NoteProvider } from './context';
import Category from './Category';
import Header from './Header';
import Notes from './Notes';
import Detail from './Detail';
import style from './index.module.less';

const { Sider, Content } = Layout;

const NoteBook: React.FC = () => {
  const { getNoteList, selectedNote, setSelectedNote } = useContext(NoteContext);

  const [showDetailModal, setShowDetailModal] = useState(false);

  // 关闭笔记详情
  const closeDetail = () => {
    setShowDetailModal(false);
    getNoteList();
  };

  // Drawer 完全关闭后再清空，避免关闭动画过程中 Detail 组件报错
  const handleDrawerAfterOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedNote(null);
    }
  };

  // 展示/关闭 笔记详情
  useEffect(() => {
    if (selectedNote) {
      setShowDetailModal(true);
    }
  }, [selectedNote]);

  return (
    <>
      <Layout>
        <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
          <Category />
        </Sider>
        <Layout>
          <Content className={style.content}>
            <Header />
            <Notes />
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={`笔记详情`}
        open={showDetailModal}
        size={800}
        styles={{ body: { padding: 0 } }}
        destroyOnHidden={true}
        onClose={closeDetail}
        afterOpenChange={handleDrawerAfterOpenChange}
      >
        <Detail selectedNote={selectedNote} />
      </Drawer>
    </>
  );
};

const NoteBookContainer: React.FC = () => {
  return (
    <NoteProvider>
      <NoteBook />
    </NoteProvider>
  );
};

export default memo(NoteBookContainer);
