import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  titleInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    minHeight: 44,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  url: {
    fontSize: 14,
    color: '#1890ff',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});

export default styles;
