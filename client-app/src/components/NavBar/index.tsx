import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Icon } from '@ant-design/react-native';

import styles from './styles';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const NavBar = ({ 
  title, 
  showBack = false, 
  onBackPress = () => {}, 
  rightComponent 
}: NavBarProps) => {
  return (
    <>
      <View style={{ height: Platform.OS === 'ios' ? 44 : 0 }}></View>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Icon name="left" color="#000" size={20} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </>
  );
};

export default NavBar;