package com.bondli.nexa.app

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * ShareModule：管理微信分享带入的 URL
 *
 * 使用内存变量代替 SharedPreferences 中转，消除异步 I/O 和时序竞争问题。
 *
 * - 冷启动：MainActivity.handleIntent 写入 pendingShareUrl，
 *           RN 调用 getInitialShareUrl() 获取后自动清空
 * - 热启动：MainActivity.sendShareUrlEvent 发送事件时直接携带 URL，
 *           RN 从事件参数取值，无需再调此方法
 */
class ShareModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "ShareModule"
    }

    override fun getName(): String = "NexaShareModule"

    /**
     * 冷启动场景：RN 侧主动调用此方法获取分享 URL，调用后自动清空，防止重复弹出
     */
    @ReactMethod
    fun getInitialShareUrl(promise: Promise) {
        val url = ShareStore.pendingShareUrl
        ShareStore.pendingShareUrl = null  // 取走即清空
        Log.d(TAG, "getInitialShareUrl: url=$url")
        promise.resolve(url)
    }
}
