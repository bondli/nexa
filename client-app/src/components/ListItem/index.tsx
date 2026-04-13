import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@ant-design/react-native';

import styles from './styles';

interface ListItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
};

const ListItem: React.FC<ListItemProps> = ({ icon, title, subtitle, extra, onPress, onLongPress }) => {
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress} activeOpacity={0.7} onLongPress={onLongPress}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <View>{title}</View>
        <View>{subtitle}</View>
      </View>
      {extra && (
        <View style={styles.extraContainer}>
          <View>{extra}</View>
          <Icon name={`right`} size={16} color={`#999`} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ListItem;