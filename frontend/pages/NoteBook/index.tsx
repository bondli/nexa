import React, { memo, useState, useEffect, useContext } from 'react';
import { Button, Modal, Layout } from 'antd';
import { NoteContext, NoteProvider } from './context';
import Category from './Category';
import MainHeader from './MainHeader';
import Notes from './Notes';
import Detail from './Detail';
import style from './index.module.less';

const { Header, Sider, Content } = Layout;

const NoteBook: React.FC = () => {
  const { getNoteList, getNoteCounts, selectedNote, setSelectedNote } = useContext(NoteContext);

  const [showDetailModal, setShowDetailModal] = useState(false);

  // 关闭笔记详情
  const closeDetail = () => {
    setSelectedNote(null);
    setShowDetailModal(false);
    getNoteList();
  };

  // 展示/关闭 笔记详情
  useEffect(() => {
    if (selectedNote) {
      setShowDetailModal(true);
    }
  }, [selectedNote]);

  return (
    <>
      <Layout className={style.container}>
        <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
          <Category />
        </Sider>
        <Layout>
          <Header className={style.header}>
            <MainHeader />
          </Header>

          <Content className={style.content}>
            <Notes />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={`笔记详情`}
        open={showDetailModal}
        width={1000}
        footer={
          <Button type={`primary`} onClick={closeDetail}>
            保存
          </Button>
        }
        destroyOnHidden={true}
        onOk={closeDetail}
        onCancel={closeDetail}
      >
        <Detail selectedNote={selectedNote} />
      </Modal>
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
