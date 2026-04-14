# Nexa

## 项目概述

nexa-personal knowledage manager

本项目特别之处在于其原生模块的实现，包括：
1. 扫码功能（实时扫描和从相册识别）
2. 本地存储功能（类似 Web 的 localStorage）
3. 直连 MySQL 数据库功能（不通过 API 桥接）

## 技术架构

### 前端技术栈
- React Native
- TypeScript
- Ant Design Mobile RN（https://rn.mobile.ant.design/docs/react/introduce-cn）

### 后端技术栈
- 直连 MySQL 数据库（通过原生模块实现）

### 原生模块
- Android: Kotlin
- 数据库连接: JDBC (Android)

## 项目结构

```
.
├── android/                 # Android 原生代码
│   └── app/src/main/java/com/bondli/cashier/app/
│       ├── ScannerModule.kt         # 扫码模块
│       ├── LocalStorageModule.kt    # 本地存储模块
│       └── MySQLModule.kt           # MySQL 连接模块
├── src/                     # React Native 业务代码
│   ├── commons/             # 公共模块
│   ├── components/          # UI 组件
│   ├── modules/             # 原生模块封装
│   ├── pages/               # 页面组件
│   ├── services/            # 业务服务（相当于API层，通过JS直接操作MySQL）
│   └── App.tsx              # 应用入口
├── index.ts                 # React Native 入口
└── package.json             # 项目依赖配置
```

## 开发环境要求

### 通用要求
- Node.js >= 16
- npm
- React Native CLI

### Android 开发环境
- Android Studio
- Android SDK
- Java Development Kit (JDK) 11

## 开发命令

### 安装依赖
```bash
npm install
```

### 启动 Metro 服务
```bash
npm run dev:android
```

需要先启动模拟器，然后端口被占用了需要先kill掉（lsof -i :8081 --> kill -9 [PID]）

### 构建 Android Release 版本
```bash
cd android && ./build-release.sh
```


## 原生模块使用说明

### 扫码模块
```typescript
import ScannerManager from './src/modules/ScannerManager';

// 实时扫码
const result = await ScannerManager.scanQRCode();

// 从相册识别二维码
const result = await ScannerManager.scanQRCodeFromFile();
```

### 本地存储模块
```typescript
import LocalStorageManager from './src/modules/LocalStorageManager';

// 设置值
await LocalStorageManager.setItem('key', 'value');

// 获取值
const value = await LocalStorageManager.getItem('key');

// 删除值
await LocalStorageManager.removeItem('key');

// 清空所有数据
await LocalStorageManager.clear();

// 获取所有键
const keys = await LocalStorageManager.getAllKeys();

// 检查键是否存在
const exists = await LocalStorageManager.hasKey('key');
```

### MySQL 数据库模块
```typescript
import MySQLManager from './src/modules/MySQLManager';

// 连接数据库
await MySQLManager.connect('host', 3306, 'database', 'username', 'password');

// 执行查询
const results = await MySQLManager.executeQuery('SELECT * FROM table');

// 执行更新
const affectedRows = await MySQLManager.executeUpdate('UPDATE table SET column = value');

// 断开连接
await MySQLManager.disconnect();
```

