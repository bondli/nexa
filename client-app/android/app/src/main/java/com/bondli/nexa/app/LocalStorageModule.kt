package com.bondli.nexa.app

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Callback

class LocalStorageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "LocalStorageModule"
        private const val SHARED_PREFS_NAME = "NexaAppLocalStorage"
    }

    private val sharedPreferences: SharedPreferences = reactContext.getSharedPreferences(SHARED_PREFS_NAME, Context.MODE_PRIVATE)

    override fun getName(): String {
        return "LocalStorageManager"
    }

    /**
     * 设置字符串值
     * @param key 键
     * @param value 值
     * @param promise Promise对象
     */
    @ReactMethod
    fun setItem(key: String, value: String, promise: Promise) {
        try {
            Log.d(TAG, "setItem: key=$key, value=$value")
            sharedPreferences.edit().putString(key, value).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "setItem error: ${e.message}", e)
            promise.reject("SET_ITEM_ERROR", e)
        }
    }

    /**
     * 获取字符串值
     * @param key 键
     * @param promise Promise对象
     */
    @ReactMethod
    fun getItem(key: String, promise: Promise) {
        try {
            val value = sharedPreferences.getString(key, null)
            Log.d(TAG, "getItem: key=$key, value=$value")
            promise.resolve(value)
        } catch (e: Exception) {
            Log.e(TAG, "getItem error: ${e.message}", e)
            promise.reject("GET_ITEM_ERROR", e)
        }
    }

    /**
     * 移除指定键
     * @param key 键
     * @param promise Promise对象
     */
    @ReactMethod
    fun removeItem(key: String, promise: Promise) {
        try {
            Log.d(TAG, "removeItem: key=$key")
            sharedPreferences.edit().remove(key).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "removeItem error: ${e.message}", e)
            promise.reject("REMOVE_ITEM_ERROR", e)
        }
    }

    /**
     * 清空所有数据
     * @param promise Promise对象
     */
    @ReactMethod
    fun clear(promise: Promise) {
        try {
            Log.d(TAG, "clear all items")
            sharedPreferences.edit().clear().apply()
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "clear error: ${e.message}", e)
            promise.reject("CLEAR_ERROR", e)
        }
    }

    /**
     * 获取所有键
     * @param promise Promise对象
     */
    @ReactMethod
    fun getAllKeys(promise: Promise) {
        try {
            val keys = sharedPreferences.all.keys.toList()
            Log.d(TAG, "getAllKeys: keys=$keys")
            
            // 创建可写数组并添加键值
            val writableArray: WritableArray = Arguments.createArray()
            for (key in keys) {
                writableArray.pushString(key)
            }
            
            // 使用resolve方法传递数组
            promise.resolve(writableArray)
        } catch (e: Exception) {
            Log.e(TAG, "getAllKeys error: ${e.message}", e)
            promise.reject("GET_ALL_KEYS_ERROR", e)
        }
    }

    /**
     * 检查键是否存在
     * @param key 键
     * @param promise Promise对象
     */
    @ReactMethod
    fun hasKey(key: String, promise: Promise) {
        try {
            val exists = sharedPreferences.contains(key)
            Log.d(TAG, "hasKey: key=$key, exists=$exists")
            promise.resolve(exists)
        } catch (e: Exception) {
            Log.e(TAG, "hasKey error: ${e.message}", e)
            promise.reject("HAS_KEY_ERROR", e)
        }
    }
}