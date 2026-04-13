import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  iconContainer: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  extraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;