## ADDED Requirements

### Requirement: 用户可通过托盘启动截图快存
托盘菜单 SHALL 包含"截图快存"入口，位于"快速笔记"之后。

#### Scenario: 点击托盘截图快存
- **WHEN** 用户点击托盘图标，选择"截图快存"
- **THEN** 弹出截图粘贴窗口

#### Scenario: 关闭截图窗口
- **WHEN** 用户在窗口中按下 ESC 键
- **THEN** 窗口关闭，结束流程

### Requirement: 用户可粘贴截图
截图粘贴窗口 SHALL 监听全局粘贴事件，支持用户使用 Cmd+V / Ctrl+V 粘贴截图。

#### Scenario: 粘贴截图
- **WHEN** 用户在窗口激活状态下按下 Cmd+V
- **THEN** 窗口显示预览图片和上传进度条

#### Scenario: 未粘贴时提交
- **WHEN** 用户点击上传按钮但未粘贴任何内容
- **THEN** 显示提示"请先粘贴截图"

#### Scenario: 粘贴非图片内容
- **WHEN** 用户粘贴文本或其他非图片内容
- **THEN** 显示提示"请粘贴图片文件"

### Requirement: 上传进度可视化
上传过程 SHALL 显示进度条，实时反馈上传状态。

#### Scenario: 上传中
- **WHEN** 截图正在上传
- **THEN** 显示进度条，提示"上传中..."

#### Scenario: 上传完成
- **WHEN** 截图上传成功
- **THEN** 进度条消失，进入 OCR 识别阶段

#### Scenario: 上传失败
- **WHEN** 截图上传失败
- **THEN** 显示错误提示，提供重试按钮