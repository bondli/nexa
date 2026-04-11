## ADDED Requirements

### Requirement: 鼠标悬停图片显示收藏角标
浏览器插件 SHALL 能够检测鼠标悬停的网页图片，并在图片右上角显示收藏角标。

#### Scenario: 悬停图片时显示角标
- **WHEN** 用户鼠标悬停在网页的图片上
- **THEN** 插件 SHALL 在图片右上角显示一个星标/收藏图标

#### Scenario: 鼠标移出图片时隐藏角标
- **WHEN** 用户鼠标从图片上移开
- **THEN** 插件 SHALL 隐藏之前显示的收藏角标

### Requirement: 点击收藏角标弹出收藏弹层
当用户点击收藏角标时，插件 SHALL 弹出一个收藏浮层供用户操作。

#### Scenario: 点击角标打开收藏弹层
- **WHEN** 用户点击图片上的收藏角标
- **THEN** 插件 SHALL 显示收藏弹层，包含：分类下拉选择、描述输入框、确认收藏按钮

#### Scenario: 弹层外部点击关闭弹层
- **WHEN** 用户点击弹层外部区域
- **THEN** 插件 SHALL 关闭收藏弹层

### Requirement: 分类下拉选择
收藏弹层 SHALL 提供分类选择功能，分类数据从服务端获取。

#### Scenario: 加载图片分类列表
- **WHEN** 收藏弹层打开时
- **THEN** 插件 SHALL 从服务端获取图片分类列表并填充下拉选择框

#### Scenario: 选择目标分类
- **WHEN** 用户在下拉框中选择一个分类
- **THEN** 插件 SHALL 记录用户选择的分类ID

### Requirement: 图片描述输入
收藏弹层 SHALL 提供可选的图片描述输入功能。

#### Scenario: 输入图片描述
- **WHEN** 用户在描述输入框中输入文字
- **THEN** 插件 SHALL 实时将输入内容保存到描述字段

### Requirement: 一键收藏图片
用户确认收藏后，插件 SHALL 将图片上传到服务端并保存到数据库。

#### Scenario: 点击收藏按钮保存图片
- **WHEN** 用户点击"收藏"按钮
- **THEN** 插件 SHALL 调用 /common/uploadImage 接口上传图片，然后调用图片保存接口

#### Scenario: 收藏成功显示提示
- **WHEN** 图片收藏成功
- **THEN** 插件 SHALL 显示成功提示，并关闭收藏弹层

#### Scenario: 收藏失败显示错误
- **WHEN** 图片收藏过程中发生错误
- **THEN** 插件 SHALL 显示错误提示信息

### Requirement: 未登录时引导登录
当用户未登录时，插件 SHALL 引导用户完成登录。

#### Scenario: 未登录时点击收藏
- **WHEN** 用户未登录状态下点击收藏按钮
- **THEN** 插件 SHALL 显示登录界面，用户完成登录后 SHALL 自动执行收藏操作