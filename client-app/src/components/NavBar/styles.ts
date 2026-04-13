import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    height: 44, 
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d7dbdf',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Android 阴影
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: '#000000',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default styles;