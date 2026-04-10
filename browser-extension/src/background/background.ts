// Background Service Worker
// 处理插件的后台逻辑

console.log('Nexa 采集插件 Background 已启动');

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('插件已安装');
    // 初始化存储
    chrome.storage.local.set({ initialized: true });
  }
});

// 监听消息传递
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // 处理来自 popup 的消息
  if (request.action === 'openCollectorPanel') {
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        sendResponse({ success: false, error: '无法获取当前标签页' });
        return;
      }

      const tabId = tabs[0].id;

      // 注入 content script
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ['assets/content.js'],
        },
        () => {
          // 发送消息给 content script
          chrome.tabs.sendMessage(tabId, { action: 'openCollectorPanel' }, (response) => {
            sendResponse({ success: true, response });
          });
        }
      );
    });

    return true; // 异步响应
  }

  // 处理 ping
  if (request.action === 'ping') {
    sendResponse({ status: 'ok' });
  }

  return true;
});

export {};