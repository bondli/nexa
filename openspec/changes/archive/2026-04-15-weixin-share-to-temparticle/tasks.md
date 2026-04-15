## 1. 数据库层

- [x] 1.1 在 TempArticle 模型中新增 `title` 字段（server/models/TempArticle.ts）

## 2. RN 端实现

- [x] 2.1 在 ArticleService.ts 中新增 `shareToTempArticle(title, url)` 方法
- [x] 2.2 创建分享接收页面 ShareArticle（接收 URL Scheme 参数，展示 title 和 url，提供保存按钮）
- [x] 2.3 配置 RN 路由，添加分享接收页面的路由配置（nexa://share/article）
- [x] 2.4 修改 Article 页面临时文章列表展示，显示 title 和 url
- [x] 2.5 点击临时文章时调用系统浏览器打开 URL

## 3. Desktop 端实现

- [x] 3.1 修改 Articles.tsx 中临时文章列表的 title 渲染，显示 title（如果存在）优先，否则显示 URL
- [x] 3.2 修改临时文章点击行为，点击 title 也在浏览器中打开 URL
- [x] 3.3 修改 Actions 组件，临时文章只显示删除按钮
- [ ] 3.4 验证临时文章软删除后可在回收站恢复

## 4. 验证测试

- [ ] 4.1 测试从微信分享文章到 Nexa，数据正确保存
- [ ] 4.2 测试 RN 端分享接收页面展示正确
- [ ] 4.3 测试 RN 端临时文章列表展示正确
- [ ] 4.4 测试 Desktop 端临时文章列表展示正确
- [ ] 4.5 测试点击临时文章能正确打开浏览器
- [ ] 4.6 测试临时文章删除后可从回收站恢复