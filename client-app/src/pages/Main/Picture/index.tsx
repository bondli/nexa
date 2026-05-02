import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator, NativeModules, PermissionsAndroid, Platform, Text } from 'react-native';
import { Toast, Icon, Picker } from '@ant-design/react-native';

import PictureService, { type Picture, type PictureCate } from '@services/PictureService';

import Empty from '@components/Empty';

import styles from './styles';

const PAGE_SIZE = 30;

// 图片格式校验
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

// Android 原生图片选择模块
const { NexaImagePicker } = NativeModules;

const PicturePage = () => {
  const [pictureList, setPictureList] = useState<Picture[]>([]);
  const [categories, setCategories] = useState<PictureCate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 大图预览状态
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  // 上传弹窗状态
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<number | null>(null);
  const [pendingUpload, setPendingUpload] = useState<{ uri: string; fileName: string } | null>(null);

  // 加载分类列表
  const loadCategories = useCallback(async () => {
    try {
      const result = await PictureService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  // 加载图片列表
  const loadPictureList = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await PictureService.getPictureList(pageNum, PAGE_SIZE, selectedCategory);

      if (pageNum === 1) {
        setPictureList(result.data);
        setRefreshing(false);
      } else {
        setPictureList(prev => [...prev, ...result.data]);
      }

      setHasMore(result.data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (error) {
      Toast.fail('获取图片列表失败');
      console.error('Error fetching picture list:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    console.log('Picture Page mounted');
    loadCategories();
    loadPictureList(1, true);
  }, [loadPictureList, loadCategories]);

  // 分类变化时重新加载
  useEffect(() => {
    loadPictureList(1, true);
  }, [selectedCategory]);

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadPictureList(1, true);
  };

  // 触底加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPictureList(page + 1);
    }
  };

  // 校验图片文件
  const validateImageFile = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      Toast.fail('不支持的图片格式，请选择 jpg、png、gif 格式');
      return false;
    }
    return true;
  };

  // 请求存储权限（Android）
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: '图片权限请求',
            message: '需要访问您的图片以进行上传',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: '存储权限请求',
            message: '需要访问您的存储以进行上传',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  // 选择图片（选择后弹出分类选择弹窗）
  const handleSelectImage = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Toast.fail('需要图片访问权限');
        return;
      }

      if (NexaImagePicker && NexaImagePicker.pickImage) {
        const result = await NexaImagePicker.pickImage();
        if (result) {
          const { uri, fileName } = result;

          if (!validateImageFile(fileName)) {
            return;
          }

          // 保存待上传信息，弹出分类选择
          setPendingUpload({ uri, fileName });
          setSelectedUploadCategory(selectedCategory); // 默认当前筛选分类
          setUploadModalVisible(true);
        }
      } else {
        Toast.fail('图片选择模块暂不可用');
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled') {
        Toast.fail('选择图片失败');
        console.error('Error selecting image:', error);
      }
    }
  };

  // 确认上传
  const handleConfirmUpload = async () => {
    if (!pendingUpload) return;

    try {
      setUploadModalVisible(false);
      Toast.loading('上传中...', 0);

      const { uri, fileName } = pendingUpload;

      // 1. 上传图片到云端
      const cloudUrl = await PictureService.uploadToCloud(uri, fileName);

      // 2. 提取文件名
      const name = fileName.replace(/\.[^.]+$/, '');

      // 3. 创建图片记录
      await PictureService.createPicture(cloudUrl, name, 1, selectedUploadCategory);

      Toast.success('上传成功');
      setPendingUpload(null);

      // 刷新列表
      loadPictureList(1, true);
    } catch (error) {
      Toast.fail('上传失败');
      console.error('Error uploading image:', error);
    }
  };

  // 预览图片
  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewImage('');
  };

  // 渲染图片卡片
  const renderPictureItem = ({ item }: { item: Picture }) => {
    const imageUrl = item.cloudUrl || item.path;
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => imageUrl && handlePreviewImage(imageUrl)}
          activeOpacity={imageUrl ? 0.8 : 1}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: '#f0f0f0' }]} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染底部加载更多
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  // 分类选择器数据（Picker value 不支持 null，用 undefined/数字表示）
  const categoryOptions = [
    { label: '全部图片', value: '' },
    ...categories.map(c => ({ label: c.name, value: c.id })),
  ];

  return (
    <View style={styles.container}>
      {/* 分类筛选 */}
      <View style={styles.filterContainer}>
        <Picker
          data={categoryOptions}
          value={selectedCategory !== null ? [selectedCategory] : ['']}
          onChange={(val) => setSelectedCategory(val[0] !== '' ? val[0] as number : null)}
        >
          <TouchableOpacity style={styles.categoryButton}>
            <Icon name="appstore" size={18} color="#666" />
            <View style={styles.categoryText}>
              <Text style={{ fontSize: 14, color: '#333' }}>
                {selectedCategory === null
                  ? '全部图片'
                  : categories.find(c => c.id === selectedCategory)?.name || '全部图片'}
              </Text>
            </View>
            <Icon name="down" size={12} color="#999" />
          </TouchableOpacity>
        </Picker>
      </View>

      {/* 图片列表 */}
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : pictureList.length === 0 ? (
        <Empty text="暂无图片" />
      ) : (
        <FlatList
          data={pictureList}
          keyExtractor={(item: Picture, index: number) => `${item.id}-${index}`}
          renderItem={renderPictureItem}
          numColumns={2}
          columnWrapperStyle={styles.gridContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* 上传按钮 */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleSelectImage} activeOpacity={0.8}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* 大图预览弹窗 */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClosePreview}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          activeOpacity={1}
          onPress={handleClosePreview}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 10 }}
            onPress={handleClosePreview}
          >
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: previewImage }} style={{ flex: 1, resizeMode: 'contain' }} />
        </TouchableOpacity>
      </Modal>

      {/* 上传分类选择弹窗 */}
      <Modal
        visible={uploadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择分类</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Picker
              data={categoryOptions}
              value={selectedUploadCategory !== null ? [selectedUploadCategory] : ['']}
              onChange={(val) => setSelectedUploadCategory(val[0] !== '' ? val[0] as number : null)}
            >
              <TouchableOpacity style={styles.pickerTrigger}>
                <Text style={styles.pickerText}>
                  {selectedUploadCategory
                    ? categories.find(c => c.id === selectedUploadCategory)?.name || '选择分类'
                    : '选择分类（可选）'}
                </Text>
                <Icon name="down" size={14} color="#999" />
              </TouchableOpacity>
            </Picker>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmUpload}>
              <Text style={styles.confirmButtonText}>确认上传</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PicturePage;
