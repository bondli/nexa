package com.bondli.nexa.app

import com.facebook.react.ReactActivity
import android.os.Bundle
import android.content.Intent
import android.util.Log
import android.net.Uri
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments

class MainActivity : ReactActivity() {
    private val TAG = "NexaApp"
    // 热启动时暂存 URL，等 onResume 时通过事件 payload 发给 RN
    private var hotStartUrl: String? = null
    // lazy 初始化，避免在 Activity 构造阶段（字段初始化）就访问 Looper
    private val mainHandler by lazy { android.os.Handler(android.os.Looper.getMainLooper()) }
    private var retryCount = 0
    private val MAX_RETRY = 10
    private val RETRY_DELAY_MS = 300L

    override fun getMainComponentName(): String? {
        Log.d(TAG, "getMainComponentName called")
        return "NexaApp"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate START")
        super.onCreate(savedInstanceState)
        // 冷启动：解析 Intent 并写入 ShareModule 内存变量
        // RN 加载完成后会主动调用 ShareModule.getInitialShareUrl() 读取
        handleIntent(intent, isColdStart = true)
        Log.d(TAG, "onCreate END")
    }

    // 热启动场景：App 在后台时微信唤起
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent called")
        setIntent(intent)
        // 热启动：解析 Intent，将 URL 暂存到 hotStartUrl，等 onResume 时通过事件携带发给 RN
        handleIntent(intent, isColdStart = false)
    }

    // onResume 时若有热启动 URL，通过事件携带 payload 发给 RN（无需再读存储）
    override fun onResume() {
        super.onResume()
        val url = hotStartUrl ?: return
        hotStartUrl = null
        retryCount = 0
        Log.d(TAG, "onResume: sending hot start share url=$url")
        sendShareUrlEvent(url)
    }

    /**
     * 向 RN 发送分享事件，直接携带 URL 作为 payload，避免 RN 侧再做一次存储读取。
     * ReactContext 可能在 onResume 时尚未就绪，使用 Handler 重试确保送达。
     */
    private fun sendShareUrlEvent(url: String) {
        val reactInstanceManager = (application as? MainApplication)
            ?.reactNativeHost?.reactInstanceManager
        val reactContext = reactInstanceManager?.currentReactContext
        if (reactContext != null) {
            val params = Arguments.createMap().apply {
                putString("url", url)
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onShareUrl", params)
            Log.d(TAG, "Sent onShareUrl event to RN (retry=$retryCount), url=$url")
        } else {
            retryCount++
            if (retryCount <= MAX_RETRY) {
                Log.w(TAG, "ReactContext is null, retry $retryCount/$MAX_RETRY after ${RETRY_DELAY_MS}ms")
                mainHandler.postDelayed({ sendShareUrlEvent(url) }, RETRY_DELAY_MS)
            } else {
                Log.e(TAG, "ReactContext still null after $MAX_RETRY retries, url lost: $url")
            }
        }
    }

    /**
     * 解析 Intent 中的分享内容：
     * - isColdStart=true：写入 ShareModule.pendingShareUrl（内存），供 RN 主动调用获取
     * - isColdStart=false：写入 hotStartUrl，等 onResume 时通过事件发给 RN
     */
    private fun handleIntent(intent: Intent?, isColdStart: Boolean) {
        if (intent == null) return

        val action = intent.action
        val uri = intent.data
        Log.d(TAG, "handleIntent action=$action, uri=$uri, isColdStart=$isColdStart")

        val shareUrl: String? = when {
            // ACTION_SEND：微信分享文本/链接（主要场景）
            Intent.ACTION_SEND == action -> {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                Log.d(TAG, "Received SEND text: $sharedText")
                if (!sharedText.isNullOrEmpty()) {
                    val extractedUrl = extractUrl(sharedText)
                    if (extractedUrl != null) {
                        "nexa://share/article?title=${Uri.encode(sharedText.take(100))}&url=${Uri.encode(extractedUrl)}"
                    } else {
                        "nexa://share/article?title=${Uri.encode(sharedText.take(100))}&url=${Uri.encode(sharedText)}"
                    }
                } else null
            }
            // ACTION_VIEW：URL Scheme 直接唤起（nexa://xxx）
            Intent.ACTION_VIEW == action && uri != null -> {
                Log.d(TAG, "Received VIEW URL: $uri")
                uri.toString()
            }
            // 其他情况：有 uri 也尝试处理
            uri != null -> {
                Log.d(TAG, "Received URL with action $action: $uri")
                uri.toString()
            }
            else -> null
        }

        if (shareUrl == null) return

        if (isColdStart) {
            ShareStore.pendingShareUrl = shareUrl
            Log.d(TAG, "Cold start: saved to ShareStore.pendingShareUrl=$shareUrl")
        } else {
            hotStartUrl = shareUrl
            Log.d(TAG, "Hot start: saved to hotStartUrl=$shareUrl")
        }
    }

    private fun extractUrl(text: String): String? {
        val urlPattern = Regex("https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+")
        return urlPattern.find(text)?.value
    }
}
