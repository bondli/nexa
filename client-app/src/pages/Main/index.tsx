import { useEffect, useContext } from 'react';
import { View } from 'react-native';

import { Icon, TabBar } from '@ant-design/react-native';

import { MainContext } from '@commons/context';
import { PAGE_MAP, type TAB_KEY } from '@commons/constants';

import NavBar from '@components/NavBar';

import NotePage from './Note';
import ArticlePage from './Article';
import ProfilePage from './Profile';

import styles from './styles';

const MainPage = () => {
  const { currentPage, setCurrentPage } = useContext(MainContext);

  useEffect(() => {
    console.log('Main Page mounted');
  }, []);

  // 切换页面
  const switchTab = (tab: TAB_KEY) => {
    setCurrentPage(tab);
  };

  return (
    <View style={styles.container}>
      <NavBar title={PAGE_MAP[currentPage as TAB_KEY].title} showBack={false} />
      <TabBar
        unselectedTintColor="#949494"
        tintColor="#456efd"
        barTintColor="#FFFFFF"
      >
        <TabBar.Item
          title={PAGE_MAP.Note.title}
          icon={<Icon name={PAGE_MAP.Note.icon as any} />}
          selected={currentPage === 'Note'}
          onPress={() => switchTab('Note')}
        >
          <NotePage />
        </TabBar.Item>

        <TabBar.Item
          title={PAGE_MAP.Article.title}
          icon={<Icon name={PAGE_MAP.Article.icon as any} />}
          selected={currentPage === 'Article'}
          onPress={() => switchTab('Article')}
        >
          <ArticlePage />
        </TabBar.Item>

        <TabBar.Item
          icon={<Icon name={PAGE_MAP.Profile.icon as any} />}
          title={PAGE_MAP.Profile.title}
          selected={currentPage === 'Profile'}
          onPress={() => switchTab('Profile')}
        >
          <ProfilePage />
        </TabBar.Item>
      </TabBar>
    </View>
  );
};

export default MainPage;