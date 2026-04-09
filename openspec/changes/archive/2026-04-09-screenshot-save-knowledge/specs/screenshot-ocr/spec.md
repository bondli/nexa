## ADDED Requirements

### Requirement: 服务端接收截图并进行 OCR 识别
服务端 SHALL 提供截图上传接口，接收图片后进行 OCR 文字识别。

#### Scenario: OCR 识别成功
- **WHEN** 服务端成功接收图片并完成 OCR
- **THEN** 返回识别到的文本内容

#### Scenario: OCR 识别失败
- **WHEN** OCR 识别过程中发生错误
- **THEN** 返回错误信息，提示用户重试或手动输入

#### Scenario: 图片过大
- **WHEN** 上传图片超过 10MB
- **THEN** 返回错误"图片过大，请压缩后重试"

### Requirement: 图片预处理
服务端 SHALL 在 OCR 前对图片进行预处理，提高识别准确率。

#### Scenario: 图片压缩
- **WHEN** 图片宽度超过 2000px
- **THEN** 自动压缩到合适尺寸后再进行 OCR

#### Scenario: 图片格式转换
- **WHEN** 上传非 PNG/JPG 格式
- **THEN** 自动转换为可识别格式