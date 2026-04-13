import { useEffect, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Modal } from '@ant-design/react-native';

// import Modal from 'react-native-modal';

import styles from './styles';

type PopupProps = {
  visible?: boolean;
  showCloseBtn?: boolean;
  content?: React.ReactNode;
  onClose?: () => void;
};
const Popup = (props: PopupProps) => {
  const {
    visible,
    showCloseBtn,
    content,
    onClose,
  } = props;

  useEffect(() => {
    // todo something
    console.log('Popup component inited');
  }, []);

  const closeDetailModal = useCallback(() => {
    // todo something
    onClose && onClose();
  }, []);

  return (
    <Modal
      visible={!!visible}
      popup={true}
      modalType={`portal`}
      onClose={closeDetailModal}
      animationType={`slide-up`}
      maskClosable={true}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <ScrollView 
          style={[styles.modalContent, !showCloseBtn ? { marginBottom: 10 } : {}]}
          scrollEnabled={true}
        >
          {content}
        </ScrollView>
        {
          showCloseBtn ? (
            <View style={styles.modalFooter}>
              <Button
                onPress={closeDetailModal}
                type={`primary`}
                size={`large`}
                style={{ width: '100%' }}
              >
                关闭
              </Button>
            </View>
          ) : null
        }
      </View>
    </Modal>
  );

};

export default Popup;
