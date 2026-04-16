package com.bondli.nexa.app

import com.facebook.react.ReactActivity
import android.os.Bundle
import android.content.Intent
import android.util.Log
import android.net.Uri

class MainActivity : ReactActivity() {
    private val TAG = "NexaApp"
    private val PENDING_URL_KEY = "pending_share_url"

    init {
        Log.d(TAG, "MainActivity init block")
    }

    override fun getMainComponentName(): String? {
        Log.d(TAG, "getMainComponentName called")
        return "NexaApp"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate START")
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate after super")
        handleIntent(intent)
        Log.d(TAG, "onCreate END")
    }

    // 处理通过 URL Scheme 唤起应用时的 Intent
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        Log.d(TAG, "onNewIntent called")
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent == null) {
            Log.d(TAG, "intent is null")
            return
        }

        val action = intent.action
        val uri = intent.data

        Log.d(TAG, "handleIntent action: $action, uri: $uri")

        // 情况1: ACTION_VIEW - 处理 URL Scheme (nexa://xxx)
        if (Intent.ACTION_VIEW == action && uri != null) {
            val url = uri.toString()
            Log.d(TAG, "Received VIEW URL: $url")
            savePendingUrl(url)
            return
        }

        // 情况2: ACTION_SEND - 处理微信分享的文本/链接
        if (Intent.ACTION_SEND == action) {
            val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
            Log.d(TAG, "Received SEND text: $sharedText")
            if (!sharedText.isNullOrEmpty()) {
                // 尝试从文本中提取 URL
                val extractedUrl = extractUrl(sharedText)
                val shareUrl = if (extractedUrl != null) {
                    "nexa://share/article?title=${Uri.encode(sharedText.take(100))}&url=${Uri.encode(extractedUrl)}"
                } else {
                    // 如果没有提取到 URL，直接用分享的文本作为 URL
                    "nexa://share/article?title=${Uri.encode(sharedText.take(100))}&url=${Uri.encode(sharedText)}"
                }
                savePendingUrl(shareUrl)
                Log.d(TAG, "Saved share URL: $shareUrl")
            }
            return
        }

        // 情况3: 如果有 uri 但 action 不是 VIEW，也尝试处理
        if (uri != null) {
            val url = uri.toString()
            Log.d(TAG, "Received URL with action $action: $url")
            savePendingUrl(url)
        }
    }

    private fun savePendingUrl(url: String) {
        val prefs = getSharedPreferences("NexaAppLocalStorage", MODE_PRIVATE)
        prefs.edit().putString(PENDING_URL_KEY, url).apply()
        Log.d(TAG, "Saved URL to SharedPreferences: $url")
    }

    private fun extractUrl(text: String): String? {
        val urlPattern = Regex("https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+")
        return urlPattern.find(text)?.value
    }
}