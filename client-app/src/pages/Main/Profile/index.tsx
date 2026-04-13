import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { Toast, ActivityIndicator, List, WhiteSpace, Icon } from '@ant-design/react-native';

import { MainContext } from '@commons/context';
import { setStorage, removeStorage } from '@commons/utils';

import ListItem from '@/components/ListItem';

import styles from './styles';

const ProfilePage = () => {
  const { userInfo, setUserInfo } = useContext(MainContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [personalDataList, setPersonalDataList] = useState<any[]>([]);
  const [storeData, setStoreData] = useState<any>({
    totalItems: 0,
    totalMembers: 0,
    totalOrders: 0,
  });


  useEffect(() => {
    // todo something
    console.log('Profile Page inited');
  }, []);

  // 退出登录
  const logout = () => {
    setStorage('userInfo', null);
    removeStorage('userInfo');
    removeStorage('salerList');

    setUserInfo({
      id: 0,
      name: '',
    });
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
          subtitle={
            <Text style={{ fontSize: 14, color: '#999'}}>{userInfo.name === 'admin' ? '管理员' : '导购员'}</Text>
          }
          extra={
            <View style={styles.logoutContainer}>
              <TouchableOpacity onPress={logout}><Text style={styles.logoutText}>退出</Text></TouchableOpacity>
            </View>
          }
        />
      </View>

      <WhiteSpace size={`lg`} />

      <List renderHeader={'店铺数据'} style={styles.dataContainer}>
        <List.Item extra={<Text style={{ color: `#f50` }}>{storeData.totalItems || 0}</Text>} arrow={`empty`}>
          库存总数
        </List.Item>
        <List.Item extra={<Text style={{ color: `#f50` }}>{storeData.totalMembers || 0}</Text>} arrow={`empty`}>
          会员总数
        </List.Item>
        <List.Item extra={<Text style={{ color: `#f50` }}>{storeData.totalOrders || 0}</Text>} arrow={`empty`}>
          订单总数
        </List.Item>
      </List>

      <WhiteSpace size={`lg`} />

      <List renderHeader={'店铺营业额'} style={styles.dataContainer}>
        {
          dataList.map((data) => {
            return (
              <List.Item
                key={data.month}
                extra={<View><Text style={{ color: '#f50' }}>{data.amount}</Text></View>}
                multipleLine
              >
                {data.month}
                <List.Item.Brief style={{ fontSize: 12, color: '#999' }}>{`订单数: ${data.orderCount} / 商品数: ${data.itemCount}`}</List.Item.Brief>
              </List.Item>
            );
          })
        }
      </List>

      <WhiteSpace size={`lg`} />

      <List renderHeader={'个人营业额'} style={styles.dataContainer}>
        {
          personalDataList.map((data) => {
            return (
              <List.Item
                key={data.month}
                extra={<View><Text style={{ color: '#f50' }}>{data.amount}</Text></View>}
                multipleLine
              >
                {data.month}
                <List.Item.Brief style={{ fontSize: 12, color: '#999' }}>{`订单数: ${data.orderCount} / 商品数: ${data.itemCount}`}</List.Item.Brief>
              </List.Item>
            );
          })
        }
      </List>

      <WhiteSpace size={`lg`} />
      <WhiteSpace size={`lg`} />

    </ScrollView>
  );

};

export default ProfilePage;
