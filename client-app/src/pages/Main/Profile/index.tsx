import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { Toast, ActivityIndicator, List, WhiteSpace, Icon } from '@ant-design/react-native';

import { MainContext } from '@commons/context';
import { setStorage, removeStorage } from '@commons/utils';
import UserService from '@services/UserService';

import ListItem from '@/components/ListItem';

import styles from './styles';

const ProfilePage = () => {
  const { userInfo, setUserInfo } = useContext(MainContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [systemData, setSystemData] = useState<any>({
    totalNotes: 0,
    totalArticles: 0,
    totalPictures: 0,
  });


  useEffect(() => {
    // todo something
    console.log('Profile Page inited');
    fetchSystemData();
  }, []);

  // 退出登录
  const logout = () => {
    setStorage('userInfo', null);
    removeStorage('userInfo');

    setUserInfo({
      id: 0,
      name: '',
    });
  };

  // 发请求取应用数据
  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const data = await UserService.getSystemData();
      setSystemData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Toast.fail('获取应用数据失败');
    } finally { 
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={`large`} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.userContainer}>
        <ListItem
          icon={<Icon name={`github`} size={24} color={`#000000`} />}
          title={
            <Text style={{ fontSize: 16, color: '#333'}}>{userInfo.name}</Text>
          }
          extra={
            <View style={styles.logoutContainer}>
              <TouchableOpacity onPress={logout}><Text style={styles.logoutText}>退出</Text></TouchableOpacity>
            </View>
          }
        />
      </View>

      <WhiteSpace size={`lg`} />

      <List renderHeader={'应用数据'} style={styles.dataContainer}>
        <List.Item extra={<Text style={{ color: `#f50` }}>{systemData.totalNotes || 0}</Text>} arrow={`empty`}>
          笔记总数
        </List.Item>
        <List.Item extra={<Text style={{ color: `#f50` }}>{systemData.totalArticles || 0}</Text>} arrow={`empty`}>
          文章总数
        </List.Item>
        <List.Item extra={<Text style={{ color: `#f50` }}>{systemData.totalPictures || 0}</Text>} arrow={`empty`}>
          图片总数
        </List.Item>
      </List>

    </ScrollView>
  );

};

export default ProfilePage;
