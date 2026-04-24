# nexa
nexa-personal knowledage manager

```
微信中看到不错的文章，进行分享到移动应用app中，回到桌面版阅读，通过浏览器插件获取成文章，好文章可以加入知识库，用于后续AI聊天检索
微信分享，先写入一个临时的表中，后续在电脑上查看之后通过浏览器插件提取到正式的文章表中
```

- 桌面端：
  - 管理笔记/文章/知识等
  - 桌面托盘：
    - 快速记录：笔记/重要的代办
    - 截图快存：1、识别成备忘；2、保存到图片库
  - AI问答和执行任务
  - 查看微信端分享进来的临时文章，对文章进行优化内容和加入到知识库
- 浏览器插件：
  - 一键提取文章内容
  - 一键收藏图片
- 移动端：
  - 查看笔记
  - 收集微信分享的文章

## spec driven development

AI驱动开发（AI-First Dev Workflow）: /opsx:propose（创建提案）→ /opsx:apply（执行）→ /opsx:archive（归档）

### step0: requirement
0. 首次新项目需要先初始化OpenSepc：openspec init .（会生成一个openspec目录和基础文件结构，以及在.claude/commands目录下生成命令）
1. 在features目录下新建自己的需求文档
2. 将需求喂投给CC

### step1: /opsx:propose（创建提案）
```
/opsx:propose ./features/xxx.md 请读取该文件作为需求输入
```
会基于本次需求生成：
changes/xxxx        ---> 需要记录这个xxxx，后续要用到
├── proposal.md    # 变更提案
├── design.md      # 技术设计
├── tasks.md       # 任务列表
└── specs/         # 规范增量

如果生成的需求方案不满意，可以：
- 1.修改desgin.md
- 2.和claude对话：
```
我会给你修改后的 design.md，请你：
1. 基于新 design 校验逻辑一致性
2. 更新 task.md
3. 指出可能遗漏的任务
```

### Step 2：/opsx:apply（执行）
```
/opsx:apply xxxx
```

### Step 3：/opsx:review（查找问题）
```
/opsx:review xxxx
```

### Step 4：/opsx:fix（问题修复）
```
/opsx:fix xxxx
```

### Step 5：/opsx:archive（归档）
```
/opsx:archive xxxx
```
规范会被合并到 openspec/specs/ 目录，成为持久规范的一部分。

## 其他

### Figma视觉稿还原：
- prompt: 请使用Figma MCP，在 @test.html 页面还原落地页设计：https://www.figma.com/design/zZQZmhP0lSw4OeCsBvuzFG/Bean-Scene-Coffee--Community-?node-id=1-4&t=2TnBNPKQMGuHxi8w-4
- 前提：安装和配置好Figma MCP插件

### stitch设计稿还原：
- prompt：使用stitch mcp修改所有页面的风格为“咸鱼App”对应的风格
- 前提：https://mp.weixin.qq.com/s/mb1rgKMmSHFXp5v24FTY2g


## 待实现的想法
- openclaw的集成，支持常见配置，对话，skill安装
- 文章加入知识库变文档的能力，加入的时候需要向量化 -- done
- 托盘支持：截图存知识，将截图粘帖到上传框，能传到服务器 -- done
- 浏览器插件：一键提取文章内容，暂不支持对话优化，提取到制定的分类 -- done
- 笔记标签：支持笔记标签，左侧有标签筛选区
- 图片页面：新增一个图片页面，将收藏的图片，全部展示出来，按时间排序 -- done
- 图片需要支持移动分类的功能，在全部图片/回收站下不能上传图片 -- done
- 图片支持分类，需要在原有的插件上支持一键收藏 -- done
- 向量服务器：部署在云端，腾讯云上 -- done
- 重构agent的实现，使用deepagent来实现
- 聊天页面左侧需要有会话分组 -- done
- android端，react-native来实现采集  -- done
- 增加文章页面，提供管理临时文章和全部文章 -- done
- 图片上传腾讯云服务器上，通过API上传，然后返回地址写到数据库中 -- done
- 笔记，文章，图片页面，列表查询支持分页和加载更多 -- done
- 设置页面，支持一切的配置设置. -- done
- UI界面支持暗黑模式切换
- 和LLM聊天：1、支持rag，这个如何使用？2、我想让他执行电脑上的工具，比如某个命令；3、自定义的skill如何喂投给他