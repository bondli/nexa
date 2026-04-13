package com.bondli.cashier.app

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.view.WindowInsetsController
import android.widget.ImageButton
import android.widget.TextView
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.CaptureManager
import com.journeyapps.barcodescanner.DecoratedBarcodeView

class ScannerActivity : Activity(), DecoratedBarcodeView.TorchListener {
    private var barcodeScannerView: DecoratedBarcodeView? = null
    private var capture: CaptureManager? = null
    private var torchButton: ImageButton? = null
    private var backButton: ImageButton? = null
    private var pickImageButton: ImageButton? = null
    private var statusText: TextView? = null
    private var isTorchOn = false
    
    companion object {
        private const val TAG = "ScannerActivity"
        private const val REQUEST_CODE_PICK_IMAGE = 1002
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scanner)
        
        // 设置状态栏和导航栏图标为浅色（适用于深色背景）
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android API 30 (Android 11) 及更高版本使用新的 API
            window.insetsController?.setSystemBarsAppearance(
                0, // 清除浅色标志，使图标变为浅色
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or 
                WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
            )
        } else {
            // Android API 30 以下版本使用旧的 API
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or 
                                                  View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            // 反转标志位，使图标变为浅色
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = window.decorView.systemUiVisibility and 
                                                 View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv() and 
                                                 View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
        }

        barcodeScannerView = findViewById(R.id.zxing_barcode_scanner)
        torchButton = findViewById(R.id.torch_button)
        backButton = findViewById(R.id.back_button)
        pickImageButton = findViewById(R.id.pick_image_button)
        statusText = findViewById(R.id.status_text)

        barcodeScannerView?.setTorchListener(this)

        backButton?.setOnClickListener {
            setResult(RESULT_CANCELED)
            finish()
        }
        
        pickImageButton?.setOnClickListener {
            pickImageFromGallery()
        }

        torchButton?.setOnClickListener {
            if (isTorchOn) {
                barcodeScannerView?.setTorchOff()
            } else {
                barcodeScannerView?.setTorchOn()
            }
        }

        capture = CaptureManager(this, barcodeScannerView!!)
        capture?.initializeFromIntent(intent, savedInstanceState)
        capture?.decode()

        barcodeScannerView?.decodeContinuous { result: BarcodeResult ->
            handleScanResult(result.text)
        }
    }
    
    private fun pickImageFromGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        startActivityForResult(intent, REQUEST_CODE_PICK_IMAGE)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == REQUEST_CODE_PICK_IMAGE && resultCode == RESULT_OK && data != null) {
            val selectedImage = data.data
            if (selectedImage != null) {
                try {
                    val inputStream = contentResolver.openInputStream(selectedImage)
                    val bitmap = BitmapFactory.decodeStream(inputStream)
                    inputStream?.close()
                    
                    // 使用 BarcodeDecoder 解码图片
                    val result = BarcodeDecoder.decodeQRCodeFromBitmap(bitmap)
                    if (result != null) {
                        handleScanResult(result)
                    } else {
                        statusText?.text = "未在图片中找到二维码"
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to process image: ${e.message}", e)
                    e.printStackTrace()
                    statusText?.text = "图片处理失败: ${e.message}"
                }
            }
        }
    }

    private fun handleScanResult(result: String) {
        val intent = Intent()
        intent.putExtra("scan_result", result)
        setResult(RESULT_OK, intent)
        finish()
    }

    override fun onResume() {
        super.onResume()
        capture?.onResume()
    }

    override fun onPause() {
        super.onPause()
        capture?.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        capture?.onDestroy()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        capture?.onSaveInstanceState(outState)
    }

    override fun onTorchOn() {
        isTorchOn = true
    }

    override fun onTorchOff() {
        isTorchOn = false
    }
}