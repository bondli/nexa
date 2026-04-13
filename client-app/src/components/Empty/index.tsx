import { View, Text } from 'react-native';
import { Icon } from '@ant-design/react-native';

import styles from './styles';

interface EmptyProps {
  text?: string;
  extra?: React.ReactNode; 
}

const Empty = ({ text = '暂无数据', extra = null }: EmptyProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Icon name={`inbox`} size={64} color={`#999`} />
        <Text style={styles.text}>{text}</Text>
      </View>
      {extra}
    </View>
  );
};

export default Empty;