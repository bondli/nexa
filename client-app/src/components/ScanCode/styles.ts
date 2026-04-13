import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#456efd',
    width: 44,
    height: 44,
    borderRadius: 22,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 3,
  },
});

export default styles;