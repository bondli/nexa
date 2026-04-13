import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Icon } from '@ant-design/react-native';

import ScannerManager from '@modules/ScannerManager';

import styles from './styles';

type ScanCodeProps = {
  onSuccess: (v: string) => void;
  onFail: (v: string) => void; 
};

const ScanCode = (props: ScanCodeProps) => {
  const { onSuccess, onFail } = props;

  useEffect(() => {
    // todo something
    console.log('ScanCode component inited');
  }, []);

  const handleScan = useCallback(async () => {
    try {
      console.log('Starting scan...');
      const result = await ScannerManager.scanQRCode();
      console.log('Scan result:', result);
      onSuccess(result);
    } catch (error: any) {
      console.error('Scan failed:', error);
      onFail(error?.message || 'Scan failed');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Icon onPress={handleScan} color={`#fff`} size={30} name={`scan`} />
    </View>
  );
};

export default ScanCode;
