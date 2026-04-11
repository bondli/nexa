// Background Service Worker
// 动态注入 content script

console.log('Nexa 采集插件 Background 已启动');

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('插件已安装');
    chrome.storage.local.set({ initialized: true });
  }
});

// 监听标签页更新，注入 content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    // 动态注入 content script
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['assets/content.js'],
    });
  }
});

// 监听消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'openPopup') {
    chrome.action.openPopup();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'ping') {
    sendResponse({ status: 'ok' });
    return true;
  }

  return true;
});

export {};