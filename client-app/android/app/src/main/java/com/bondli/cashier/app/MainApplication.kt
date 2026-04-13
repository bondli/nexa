package com.bondli.cashier.app

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import android.content.pm.ApplicationInfo
import com.facebook.react.defaults.DefaultReactNativeHost
import android.util.Log
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.bondli.cashier.app.LocalStorageModule


class MainApplication : Application(), ReactApplication {
    companion object {
        private const val TAG = "MainApplication"
    }
    
    private val mReactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            // 强制禁用开发者支持，始终使用bundle文件
            Log.d(TAG, "getUseDeveloperSupport: 强制禁用开发者支持，使用bundle文件")
            return false
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
                            modules.add(ScannerModule(reactContext))
                            Log.d(TAG, "ScannerModule initialized successfully")
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to initialize ScannerModule", e)
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

        override fun getBundleAssetName(): String? {
            // 始终使用本地bundle文件
            val bundleName = "index.android.bundle"
            Log.d(TAG, "getBundleAssetName: 使用本地bundle文件 - $bundleName")
            return bundleName
        }
        
        
        
        // 添加这个方法来启用全屏模式，让RN页面从状态栏顶端开始渲染
        // override fun isConcurrentRootEnabled(): Boolean {
        //     return true
        // }
    }

    override val reactNativeHost: ReactNativeHost = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate: Application starting")
        SoLoader.init(this, false) // 关闭crashlytics
    }
}