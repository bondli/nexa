# article-image-template-optimization

文章图片模板优化规范

## ADDED Requirements

### Requirement: 文章图片模板字体大小优化

文章图片生成 HTML 模板 SHALL 使用更小的字体大小，以提升美观度和信息密度。

#### Scenario: 标题字体缩小
- **WHEN** 生成文章图片
- **THEN** 主标题使用 48px 字体大小（优化前 72px）

#### Scenario: 副标题字体缩小
- **WHEN** 生成文章图片
- **THEN** 副标题使用 20px 字体大小（优化前 30px）

#### Scenario: KPI 数值字体缩小
- **WHEN** 生成文章图片
- **THEN** KPI 数值使用 40px 字体大小（优化前 56px）

#### Scenario: KPI 标签字体缩小
- **WHEN** 生成文章图片
- **THEN** KPI 标签使用 18px 字体大小（优化前 26px）

#### Scenario: 正文字体缩小
- **WHEN** 生成文章图片
- **THEN** 正文描述使用 16-18px 字体大小（优化前 24-28px）

### Requirement: 模板布局保持协调

字体缩小后，模板整体布局 SHALL 保持协调和美观。

#### Scenario: KPI 卡片不溢出
- **WHEN** 生成包含较长数值的 KPI 卡片
- **THEN** 数值在卡片内正常显示，不会溢出边框

#### Scenario: 重点信息区域自适应
- **WHEN** 生成包含较长描述的重点信息
- **THEN** 描述文字换行正确，布局不混乱
