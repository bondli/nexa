package com.bondli.cashier.app

import com.facebook.react.ReactActivity
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.os.Build

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String? {
        return "CashierApp"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 设置窗口背景颜色为白色
        window.setBackgroundDrawableResource(android.R.color.white)
        
        // 设置状态栏和导航栏文字和图标颜色为深色（适用于浅色背景）
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android API 30 (Android 11) 及更高版本使用新的 API
            window.insetsController?.setSystemBarsAppearance(
                android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
                android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
                android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
            )
        } else {
            // Android API 30 以下版本使用旧的 API
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or 
                                                  View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        }
        
        // 如果需要透明状态栏，可以添加以下代码
        // window.setFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS, WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
    }
}