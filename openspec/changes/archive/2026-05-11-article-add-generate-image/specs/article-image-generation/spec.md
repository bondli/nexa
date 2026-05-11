## ADDED Requirements

### Requirement: 文章无图片时点击 Avatar 触发 AI 图片生成

当文章的 `image` 字段为空时，点击文章列表中的 Avatar 图标 SHALL 触发 AI 图片生成流程。系统 SHALL 打开一个 Modal 窗口显示加载状态。

### Requirement: Modal 显示生成进度

Modal 窗口 SHALL 显示当前生成步骤的状态，包括：
- 初始状态："正在调用AI生成图片，请稍等..."
- HTML生成成功后的预览和转换提示
- 图片上传成功后的完成提示

### Requirement: 调用后端生成 HTML 内容

点击生成按钮后，系统 SHALL 调用 `/article/generate-image` 接口，传递文章的 `title` 和 `summary` 字段，接收返回的 HTML 内容。

### Requirement: HTML 内容预览与转换

HTML 内容生成成功后，Modal SHALL 使用 `html2canvas` 将 HTML 预览 div 渲染为 canvas，然后转换为图片 blob。

### Requirement: 图片上传到云端

图片 blob SHALL 通过 `/common/uploadFile?fileType=image` 接口上传，上传成功后获得云端 URL。

### Requirement: 更新文章图片字段

图片上传成功后，系统 SHALL 调用 `/article/update` 接口，只更新文章的 `image` 字段为云端 URL。

### Requirement: 生成失败显示错误信息

如果生成、转换或上传过程中发生任何错误，系统 SHALL 使用 Antd Message 显示错误信息，不关闭 Modal。

#### Scenario: 无图片文章触发生成
- **WHEN** 用户点击无图片文章的 Avatar
- **THEN** 系统打开 Modal 并显示 "正在调用AI生成图片，请稍等..."

#### Scenario: HTML 生成成功
- **WHEN** 后端 `/article/generate-image` 返回成功
- **THEN** Modal 显示 HTML 预览内容，并显示 "转换为图片并上传" 按钮

#### Scenario: 图片转换并上传成功
- **WHEN** 用户点击 "转换为图片并上传" 按钮
- **THEN** 图片上传到云端成功后，Modal 显示上传成功状态

#### Scenario: 更新文章图片成功
- **WHEN** 图片上传成功后用户完成操作
- **THEN** Modal 关闭，文章列表刷新，显示新的封面图

#### Scenario: 生成过程中发生错误
- **WHEN** 任何步骤发生错误（网络、接口异常等）
- **THEN** 显示错误提示信息，Modal 保持打开，用户可重试
