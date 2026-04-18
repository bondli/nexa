import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    padding: 16,
  },
  listFooter: {
    padding: 16,
    alignItems: 'center',
  },

  summaryContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailContainer: {
    backgroundColor: '#fff',
  },
  detailContent: {
    padding: 16,
    fontSize: 12,
  },
});

export default styles;