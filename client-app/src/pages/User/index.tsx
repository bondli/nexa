import { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import { Input, Button, WhiteSpace, List, Toast, Icon } from '@ant-design/react-native';

import { MainContext } from '@commons/context';
import { setStorage } from '@commons/utils';
import UserService from '@services/UserService';

import NavBar from '@components/NavBar';

import styles from './styles';

const UserPage = () => {
  const { setUserInfo } = useContext(MainContext);

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPwd, setUserPwd] = useState('');

  useEffect(() => {
    console.log('User Page mounted');
  }, []);

  const handleLogin = async () => {
    if (!userName.trim() || !userPwd.trim()) {
      Toast.fail('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const user = await UserService.userLogin(userName, userPwd);
      const finallyUser = {
        id: user.id,
        name: user.name,
    };

      // 保存到本地存储
      setStorage('userInfo', finallyUser);
      setUserInfo(finallyUser);
      
      // 显示成功消息
      Toast.success('登录成功');

      // 获取用户列表，写到缓存中
      const userList = await UserService.getUserList();
      setStorage('salerList', userList);
    } catch (error: any) {
      console.error('Login failed:', error);
      Toast.fail(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <NavBar title={`用户登录`} showBack={false} />

      <View style={styles.imageContainer}>
        <Icon name={`github`} size={100} color={`#000000`} />
      </View>

      <WhiteSpace size="lg" />

      <List>
        <List.Item>
          <Input
            value={userName}
            onChangeText={setUserName}
            placeholder={`请输入用户名`}
            disabled={loading}
            allowClear
          />
        </List.Item>
        <List.Item>
          <Input
            value={userPwd}
            onChangeText={setUserPwd}
            placeholder={`请输入密码`}
            type={`password`}
            disabled={loading}
            allowClear
          />
        </List.Item>
      </List>

      <WhiteSpace size={`lg`} />

      <View style={styles.buttonContainer}>
        <Button 
          type={`primary`}
          loading={loading}
          onPress={handleLogin}
          style={{ flex: 1 }}
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </View>
    </View>
  );
};

export default UserPage;