plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.bondli.nexa.app"
    compileSdk = 36

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
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false  // 暂时禁用代码混淆
            isShrinkResources = false  // 暂时禁用资源压缩
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // 使用 release 签名配置
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            isMinifyEnabled = false
            // debug 构建不打包 JS Bundle，依赖 Metro 开发服务器
            // 这行配置确保 debug 构建不会将 bundle 打包到 assets
            project.ext.set("reactNativeBundleInDebug", false)
            // 为debug版本禁用ABI分割，以便在所有架构的模拟器上运行
            ndk {
                abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64"))
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    // 注释掉ABI分割配置，避免构建特定架构的APK
    /*
    splits {
        abi {
            isEnable = true
            reset()
            include("armeabi-v7a", "arm64-v8a")
            isUniversalApk = false
        }
    }
    */
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            // 排除可能导致冲突的文件
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
            pickFirsts += "**/libcrypto.so"
            pickFirsts += "**/libssl.so"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.react.android)
    implementation(libs.hermes.android)
    
    // ZXing barcode scanner
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
    implementation("com.google.zxing:core:3.5.1")
    // 使用Android兼容的MySQL驱动 - 更低版本以提高兼容性
    implementation("mysql:mysql-connector-java:5.1.49")
    
    // 添加Android兼容性库
    implementation("androidx.annotation:annotation:1.7.0")
}