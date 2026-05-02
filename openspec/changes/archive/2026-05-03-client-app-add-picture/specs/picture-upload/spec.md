## ADDED Requirements

### Requirement: 图片上传功能

系统 SHALL 提供图片上传功能，允许用户选择本地图片并上传到服务器。

#### Scenario: 选择图片上传
- **WHEN** 用户点击上传按钮并选择一张 jpg/png/gif 图片（小于 10M）
- **THEN** 系统上传图片到服务器，成功后刷新列表显示新图片

#### Scenario: 上传不支持的格式
- **WHEN** 用户选择非 jpg/png/gif 格式的图片
- **THEN** 系统提示用户不支持该图片格式

#### Scenario: 上传超过大小限制的图片
- **WHEN** 用户选择大于 10M 的图片
- **THEN** 系统提示用户图片大小超出限制

#### Scenario: 上传失败处理
- **WHEN** 图片上传过程中发生网络错误
- **THEN** 系统显示上传失败提示，允许用户重试

### Requirement: Android 原生图片选择模块

Android 原生层 SHALL 提供图片选择模块，通过 React Native Bridge 暴露给 RN 侧调用。

#### Scenario: 调用原生图片选择器
- **WHEN** RN 侧调用图片选择接口
- **THEN** 原生模块打开系统图片选择器，用户选择后返回图片路径或 Base64 数据

#### Scenario: 权限请求
- **WHEN** 原生图片选择器首次启动
- **THEN** 系统请求存储读取权限，用户授权后继续图片选择流程
