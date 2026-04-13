# Nexa - AI 知识库桌面应用

## 需求功能
- 新增一个`Article`页面，实现相关的管理功能
- 新增的这个`Article`页面，放在`/frontend/pages/Article` 目录下，功能和UI对齐`Note`页面
  - 左侧固定的虚拟分类有：全部文章，临时文章、回收站
  - 样式上，临时文章列表仅展示url和加入时间，点击url,跳转到浏览器打开url
  - 其他的文章展示上和Note页面一致，url使用一个图标展示在文章标题后面，点击跳转到浏览器打开url
  - 每个文章的操作功能上：相比Note,保留：删除，移动分类，已删除的支持恢复
- 新增的这个`Article`页面，需要实现的功能点：
  - 文章列表展示，支持分页，支持搜索（根据标题），支持按照时间倒序排列；
  - 文章详情展示，支持markdown渲染，支持编辑（编辑后可以保存）；
  - 文章的新增，支持markdown编辑器，支持保存；
- 对应新增服务端接口/模型能力
  - 新增文章表，文章分类表，对齐Note和Cate，取名：
    - Article（一定需要有一个url的字段）
    - ArticleCate
  - 新增文章相关接口，对齐note和cate，取名：
    - /article/list
    - /article/detail
    - /article/update
    - /article/create
    - /article/delete
    - /article_cate/create
    - /article_cate/list
    - /article_cate/update
    - /article_cate/delete
  - 需要额外一个临时文章表（TempArticle），用于保存通过其他渠道写入的文章
    - 字段上仅仅需要包含：url、userId、createdAt
    - 仅仅需求实现查询列表接口（/tempArtticle/list），删除接口（/tempArtticle/delete，物理硬删除）