# nexa
nexa-personal knowledage manager

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

### Step 2：/opsx:apply（执行）
```
/opsx:apply xxxx
```


### Step 3：/opsx:archive（归档）
```
/opsx:archive xxxx
```
规范会被合并到 openspec/specs/ 目录，成为持久规范的一部分。

