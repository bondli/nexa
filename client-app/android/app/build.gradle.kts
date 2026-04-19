plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.bondli.nexa.app"
    compileSdk = 36
    ndkVersion = "28.1.13356709"

    // 启用 BuildConfig 生成
    buildFeatures {
        buildConfig = true
    }

    defaultConfig {
        applicationId = "com.bondli.nexa.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        // 传递开发服务器配置到 BuildConfig
        val devServerEnabled = project.findProperty("reactNativeDevServerEnabled")?.toString()?.toBoolean() ?: false
        buildConfigField("boolean", "REACT_NATIVE_DEV_SERVER_ENABLED", "$devServerEnabled")
        
        // 传递开发服务器 URL 到 BuildConfig
        val devServerUrl = project.findProperty("reactNativeDevServerUrl")?.toString() ?: "10.0.2.2:8081"
        buildConfigField("String", "REACT_NATIVE_DEV_SERVER_URL", "\"$devServerUrl\"")
    }

    // 配置签名
    signingConfigs {
        create("release") {
            val keystorePath = project.findProperty("MYAPP_RELEASE_STORE_FILE") as String? ?: "nexa-release-key.keystore"
            storeFile = file(rootProject.file(keystorePath))
            storePassword = project.findProperty("MYAPP_RELEASE_STORE_PASSWORD") as String?
            keyAlias = project.findProperty("MYAPP_RELEASE_KEY_ALIAS") as String?
            keyPassword = project.findProperty("MYAPP_RELEASE_KEY_PASSWORD") as String?
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false  // 暂时禁用代码混淆
            isShrinkResources = false  // 暂时禁用资源压缩
            isDebuggable = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // 使用 release 签名配置
            signingConfig = signingConfigs.getByName("release")
            // 确保 release 构建打包 JS bundle
            project.ext.set("reactNativeBundleInRelease", true)
            // 为 release 版本也添加 NDK abiFilters
            ndk {
                abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
            }
        }
        debug {
            isMinifyEnabled = false
            // debug 构建不打包 JS Bundle，依赖 Metro 开发服务器
            project.ext.set("reactNativeBundleInDebug", false)
            // 只打 arm64，减小 APK 体积方便模拟器安装（模拟器为 arm64 架构）
            ndk {
                abiFilters.addAll(listOf("arm64-v8a"))
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    // assets 中的 JS bundle 不压缩，Hermes 需要直接 mmap 读取
    aaptOptions {
        noCompress("js", "bundle")
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "META-INF/DEPENDENCIES"
            excludes += "META-INF/LICENSE"
            excludes += "META-INF/LICENSE.txt"
            excludes += "META-INF/license.txt"
            excludes += "META-INF/NOTICE"
            excludes += "META-INF/NOTICE.txt"
            excludes += "META-INF/notice.txt"
            excludes += "META-INF/ASL2.0"
            excludes += "META-INF/*.kotlin_module"
        }
        jniLibs {
            // 保留所有 native 库，避免 Release 包缺少 SSL 库
            pickFirsts += listOf(
                "**/libcrypto.so",
                "**/libssl.so",
                "**/libc++_shared.so"
            )
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.react.android)
    implementation(libs.hermes.android)

    // MySQL 驱动 - 使用旧版包名以兼容现有代码
    implementation("mysql:mysql-connector-java:5.1.49")

    // AndroidX 兼容性库 - 更新到最新版本
    implementation("androidx.annotation:annotation:1.8.0")
}
