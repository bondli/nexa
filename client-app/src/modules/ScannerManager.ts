import { NativeModules, Platform } from 'react-native';

const { ScannerManager } = NativeModules;

interface ScannerManagerInterface {
  scanQRCode(): Promise<string>;
  scanQRCodeFromFile(): Promise<string>;
}

const ScannerManagerModule: ScannerManagerInterface = {
  scanQRCode: (): Promise<string> => {
    return ScannerManager.scanQRCode();
  },

  scanQRCodeFromFile: (): Promise<string> => {
    return ScannerManager.scanQRCodeFromFile();
  }
};

export default ScannerManagerModule;