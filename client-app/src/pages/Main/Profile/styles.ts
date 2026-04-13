import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  userContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5f5f5',
  },
  logoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  logoutText: {
    color: '#456efd',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dataContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  }
});

export default styles;