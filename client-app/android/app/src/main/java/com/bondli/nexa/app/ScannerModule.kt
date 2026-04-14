package com.bondli.nexa.app

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import androidx.activity.ComponentActivity
import com.facebook.react.bridge.*
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import java.io.InputStream

class ScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    companion object {
        private const val TAG = "ScannerModule"
        private const val REQUEST_CODE_SCAN = 1001
        private const val REQUEST_CODE_PICK_IMAGE = 1002
    }

    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "ScannerManager"
    }

    @ReactMethod
    fun scanQRCode(promise: Promise) {
        this.promise = promise
        val currentActivity = currentActivity
        if (currentActivity == null) {
            Log.e(TAG, "Activity doesn't exist")
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        try {
            // 启动扫码Activity
            val intent = Intent(currentActivity, ScannerActivity::class.java)
            currentActivity.startActivityForResult(intent, REQUEST_CODE_SCAN)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start scanner: ${e.message}", e)
            promise.reject("E_SCAN_FAILED", "Failed to start scanner: ${e.message}")
        }
    }

    @ReactMethod
    fun scanQRCodeFromFile(promise: Promise) {
        this.promise = promise
        val currentActivity = currentActivity
        if (currentActivity == null) {
            Log.e(TAG, "Activity doesn't exist")
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        try {
            // 启动图片选择器
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            currentActivity.startActivityForResult(intent, REQUEST_CODE_PICK_IMAGE)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to pick image: ${e.message}", e)
            promise.reject("E_PICK_IMAGE_FAILED", "Failed to pick image: ${e.message}")
        }
    }

    // ActivityEventListener 接口实现
    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        handleActivityResult(requestCode, resultCode, data)
    }

    override fun onNewIntent(intent: Intent?) {
        // 不需要实现
    }

    private fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (promise != null) {
            when (requestCode) {
                REQUEST_CODE_SCAN -> {
                    if (resultCode == ComponentActivity.RESULT_OK && data != null) {
                        val result = data.getStringExtra("scan_result")
                        if (result != null) {
                            promise?.resolve(result)
                        } else {
                            Log.e(TAG, "Scan cancelled or failed - no result")
                            promise?.reject("E_SCAN_CANCELLED", "Scan cancelled or failed")
                        }
                    } else {
                        Log.e(TAG, "Scan cancelled or failed - resultCode: $resultCode, data: $data")
                        promise?.reject("E_SCAN_CANCELLED", "Scan cancelled or failed")
                    }
                }
                REQUEST_CODE_PICK_IMAGE -> {
                    if (resultCode == ComponentActivity.RESULT_OK && data != null) {
                        try {
                            val selectedImage: Uri? = data.data
                            if (selectedImage != null) {
                                val inputStream: InputStream? = reactApplicationContext.contentResolver.openInputStream(selectedImage)
                                val bitmap = BitmapFactory.decodeStream(inputStream)
                                inputStream?.close()
                                
                                // 使用 BarcodeDecoder 解码图片
                                val result = BarcodeDecoder.decodeQRCodeFromBitmap(bitmap)
                                if (result != null) {
                                    promise?.resolve(result)
                                } else {
                                    Log.e(TAG, "Failed to decode QR code from image")
                                    promise?.reject("E_DECODE_FAILED", "Failed to decode QR code from image")
                                }
                            } else {
                                Log.e(TAG, "No image selected")
                                promise?.reject("E_NO_IMAGE_SELECTED", "No image selected")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to process image: ${e.message}", e)
                            promise?.reject("E_PROCESS_IMAGE_FAILED", "Failed to process image: ${e.message}")
                        }
                    } else {
                        Log.e(TAG, "Image pick cancelled or failed - resultCode: $resultCode, data: $data")
                        promise?.reject("E_IMAGE_PICK_CANCELLED", "Image pick cancelled or failed")
                    }
                }
            }
            promise = null
        }
    }
}