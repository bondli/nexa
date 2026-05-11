## 1. 创建 GenerateImageModal 组件

- [x] 1.1 在 `frontend/components/` 下创建 `GenerateImageModal` 目录
- [x] 1.2 创建 `index.tsx` 和 `index.module.less` 文件
- [x] 1.3 实现 Modal 状态管理（生成/上传/完成三个步骤）
- [x] 1.4 调用 `/article/generate-image` 生成 HTML 内容
- [x] 1.5 使用 html2canvas 将 HTML 转为图片
- [x] 1.6 上传图片到 `/common/uploadFile?fileType=image`
- [x] 1.7 调用 `/article/update` 更新文章 image 字段
- [x] 1.8 添加错误处理和加载状态

## 2. 修改 Articles.tsx 支持触发生成

- [x] 2.1 在 Articles.tsx 中引入 GenerateImageModal 组件
- [x] 2.2 修改 `renderAvatar` 函数，无图片文章点击时打开 Modal
- [x] 2.3 生成成功后关闭 Modal 并刷新文章列表
- [x] 2.4 传递文章 title 和 desc 给 Modal

## 3. 添加 html2canvas 依赖

- [x] 3.1 检查 package.json 是否已有 html2canvas
- [x] 3.2 html2canvas 已存在 (^1.4.1)，无需添加
