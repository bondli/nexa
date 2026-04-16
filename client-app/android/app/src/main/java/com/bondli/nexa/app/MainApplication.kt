package com.bondli.nexa.app

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.bondli.nexa.app.LocalStorageModule


class MainApplication : Application(), ReactApplication {
    companion object {
        private const val TAG = "MainApplication"
        // Metro 开发服务器默认地址（Android 模拟器访问宿主机）
        private const val DEFAULT_DEV_SERVER_URL = "http://10.0.2.2:8081"

        // 获取开发服务器 URL，支持自定义配置
        fun getDevServerUrl(): String {
            return try {
                // 尝试从 BuildConfig 获取自定义 URL
                val customUrl = BuildConfig.REACT_NATIVE_DEV_SERVER_URL
                if (customUrl.isNotEmpty() && customUrl != "10.0.2.2:8081") {
                    "http://$customUrl"
                } else {
                    DEFAULT_DEV_SERVER_URL
                }
            } catch (e: Exception) {
                DEFAULT_DEV_SERVER_URL
            }
        }
    }

    private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            // debug 构建时启用开发者支持，从 Metro 服务器加载 JS
            // release 构建返回 false，使用本地 bundle
            val isDebug = BuildConfig.DEBUG
            Log.d(TAG, "getUseDeveloperSupport: isDebug=$isDebug")
            return isDebug
        }

        override fun getJSBundleFile(): String? {
            // debug 模式返回 null，让 React Native 从开发服务器加载
            // release 模式返回本地 bundle 路径
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "getJSBundleFile: debug 模式，从 Metro 服务器加载，URL: ${getDevServerUrl()}")
                return null
            }
            val bundleName = "index.android.bundle"
            Log.d(TAG, "getJSBundleFile: release 模式，使用本地bundle - $bundleName")
            return "assets/$bundleName"
        }

        override fun getPackages(): List<ReactPackage> =
            listOf(
                MainReactPackage(),
                object : ReactPackage {
                    override fun createNativeModules(reactContext: ReactApplicationContext): List<com.facebook.react.bridge.NativeModule> {
                        val modules = mutableListOf<com.facebook.react.bridge.NativeModule>()
                        
                        try {
                            modules.add(LocalStorageModule(reactContext))
                            Log.d(TAG, "LocalStorageModule initialized successfully")
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to initialize LocalStorageModule", e)
                        }

                        try {
                            modules.add(MySQLModule(reactContext))
                            Log.d(TAG, "MySQLModule initialized successfully")
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to initialize MySQLModule", e)
                        }
                        
                        Log.d(TAG, "Total modules initialized: ${modules.size}")
                        return modules
                    }

                    override fun createViewManagers(reactContext: ReactApplicationContext): List<com.facebook.react.uimanager.ViewManager<*, *>> {
                        return emptyList()
                    }
                }
            )

        override fun getJSMainModuleName(): String = "index"
    }

    override val reactNativeHost: ReactNativeHost = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate: Application starting")
        SoLoader.init(this, false)
    }
}