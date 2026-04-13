import { View, Text } from 'react-native';

import styles from './styles';

const Statistic = ({ title, value }: { title: string; value: number | string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default Statistic;