import { NativeModules } from 'react-native';

const { NexaShareModule } = NativeModules;

interface NexaShareModuleInterface {
  /**
   * 冷启动场景：获取 MainActivity 解析好的初始分享 URL
   * 调用后自动清空，防止重复弹出
   */
  getInitialShareUrl(): Promise<string | null>;
}

const NexaShareModuleInterface: NexaShareModuleInterface = {
  getInitialShareUrl: (): Promise<string | null> => {
    if (!NexaShareModule) {
      console.warn('NexaShareModule is not available (undefined)');
      return Promise.resolve(null);
    }
    if (typeof NexaShareModule.getInitialShareUrl !== 'function') {
      console.warn('NexaShareModule.getInitialShareUrl is not a function, module keys:', Object.keys(NexaShareModule));
      return Promise.resolve(null);
    }
    return NexaShareModule.getInitialShareUrl();
  },
};

export default NexaShareModuleInterface;
