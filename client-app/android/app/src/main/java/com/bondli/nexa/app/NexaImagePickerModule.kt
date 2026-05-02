package com.bondli.nexa.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

/**
 * NexaImagePickerModule：原生图片选择模块
 *
 * 提供从系统相册选择图片的能力，返回图片 URI 和文件名给 React Native 侧。
 */
class NexaImagePickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "NexaImagePickerModule"
        private const val IMAGE_PICKER_REQUEST_CODE = 1001
    }

    private var imagePickerPromise: Promise? = null

    // Activity 事件监听器，用于处理图片选择结果
    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == IMAGE_PICKER_REQUEST_CODE) {
                if (imagePickerPromise != null) {
                    if (resultCode == Activity.RESULT_OK && data != null) {
                        try {
                            val selectedImageUri: Uri? = data.data
                            if (selectedImageUri != null) {
                                // 获取文件名
                                val fileName = getFileNameFromUri(selectedImageUri)

                                // 构建结果数据
                                val result: WritableMap = WritableNativeMap()
                                result.putString("uri", selectedImageUri.toString())
                                result.putString("fileName", fileName)

                                Log.d(TAG, "Image selected: $selectedImageUri, fileName: $fileName")
                                imagePickerPromise?.resolve(result)
                            } else {
                                imagePickerPromise?.reject("PICK_ERROR", "未选择图片")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error handling image result", e)
                            imagePickerPromise?.reject("PICK_ERROR", e.message)
                        }
                    } else {
                        // 用户取消
                        imagePickerPromise?.reject("USER_CANCELLED", "User cancelled")
                    }
                    imagePickerPromise = null
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "NexaImagePicker"

    /**
     * 打开系统图片选择器
     * 返回 Promise，包含 uri 和 fileName
     */
    @ReactMethod
    fun pickImage(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_ERROR", "Activity is not available")
            return
        }

        imagePickerPromise = promise

        try {
            // 打开系统相册
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            intent.type = "image/*"

            // 设置可选择的图片类型
            val mimeTypes = arrayOf("image/jpeg", "image/png", "image/gif")
            intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)

            activity.startActivityForResult(intent, IMAGE_PICKER_REQUEST_CODE)
            Log.d(TAG, "Image picker started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting image picker", e)
            imagePickerPromise?.reject("PICK_ERROR", e.message)
            imagePickerPromise = null
        }
    }

    /**
     * 从 Uri 获取文件名
     */
    private fun getFileNameFromUri(uri: Uri): String {
        var fileName = "image"
        try {
            val cursor = currentActivity?.contentResolver?.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val nameIndex = it.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)
                    if (nameIndex >= 0) {
                        fileName = it.getString(nameIndex) ?: "image"
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting file name", e)
            // 如果查询失败，使用默认文件名
            fileName = "image_${System.currentTimeMillis()}"
        }
        return fileName
    }
}
