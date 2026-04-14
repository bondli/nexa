#!/bin/bash
# 生成 Android 签名密钥

echo "🔐 生成 Android Release 签名密钥"
echo ""
echo "⚠️  重要提示："
echo "  1. 请妥善保管生成的密钥文件和密码"
echo "  2. 密钥丢失将无法更新应用"
echo "  3. 建议将密钥备份到安全位置"
echo ""

# 密钥文件名
KEYSTORE_FILE="nexa-release-key.keystore"

# 检查是否已存在
if [ -f "$KEYSTORE_FILE" ]; then
    echo "❌ 密钥文件已存在: $KEYSTORE_FILE"
    echo "如果要重新生成，请先删除旧文件："
    echo "  rm $KEYSTORE_FILE"
    exit 1
fi

echo "开始生成密钥..."
echo ""

# 生成密钥
keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -alias nexa-key-alias \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 密钥生成成功！"
    echo ""
    echo "📁 密钥文件: $KEYSTORE_FILE"
    echo "🔑 密钥别名: nexa-key-alias"
    echo ""
    echo "📋 下一步："
    echo "  1. 记录密钥密码（刚才输入的）"
    echo "  2. 编辑 gradle.properties 添加签名配置"
    echo "  3. 运行 ./gradlew assembleRelease 构建"
else
    echo ""
    echo "❌ 密钥生成失败"
    exit 1
fi
