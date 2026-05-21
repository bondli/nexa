import { createRoot } from 'react-dom/client';
import { App, ConfigProvider, notification } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { MainProvider } from '@commons/context';
import QuickNote from '@blocks/QuickNote';
import CaptureSave from '@blocks/CaptureSave';
import ThemeProvider from '@components/ThemeProvider';
import AppContainer from './App';

import 'antd/dist/reset.css';

// 配置 dayjs 时区
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');
dayjs.tz.setDefault('Asia/Shanghai');

dayjs.locale('zh-cn');

notification.config({
  placement: 'topRight',
  top: 20,
  duration: 3,
  rtl: false,
});

// 判断是否为快速笔记窗口
const isQuickNote = (): boolean => {
  const hash = window.location.hash;
  return hash === '#/quick-note' || hash.includes('quick-note');
};

// 判断是否为截图快存窗口
const isScreenshotCapture = (): boolean => {
  const hash = window.location.hash;
  return hash === '#/screenshot-capture' || hash.includes('screenshot-capture');
};

const root = createRoot(document.getElementById('root'));

// 截图快存窗口独立渲染
if (isScreenshotCapture()) {
  root.render(
    <ThemeProvider>
      <App>
        <ConfigProvider locale={zhCN} input={{ autoComplete: 'off' }}>
          <CaptureSave />
        </ConfigProvider>
      </App>
    </ThemeProvider>,
  );
} else if (isQuickNote()) {
  root.render(
    <ThemeProvider>
      <App>
        <ConfigProvider locale={zhCN} input={{ autoComplete: 'off' }}>
          <QuickNote />
        </ConfigProvider>
      </App>
    </ThemeProvider>,
  );
} else {
  root.render(
    <ThemeProvider>
      <App>
        <ConfigProvider locale={zhCN} input={{ autoComplete: 'off' }}>
          <MainProvider>
            <AppContainer />
          </MainProvider>
        </ConfigProvider>
      </App>
    </ThemeProvider>,
  );
}
