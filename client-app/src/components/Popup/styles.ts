import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    height: 600,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: 600,
    position: 'relative',
  },
  modalContent: {
    flex: 1,
    height: 520,
    marginBottom: 80, // 为底部按钮留出空间
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
});

export default styles;