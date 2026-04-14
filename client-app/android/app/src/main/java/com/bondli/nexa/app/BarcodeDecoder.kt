package com.bondli.nexa.app

import android.graphics.Bitmap
import com.google.zxing.*
import com.google.zxing.common.HybridBinarizer

class BarcodeDecoder {
    companion object {
        fun decodeQRCodeFromBitmap(bitmap: Bitmap): String? {
            try {
                val intArray = IntArray(bitmap.width * bitmap.height)
                bitmap.getPixels(intArray, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

                val source = RGBLuminanceSource(bitmap.width, bitmap.height, intArray)
                val binaryBitmap = BinaryBitmap(HybridBinarizer(source))
                val reader = MultiFormatReader()
                
                val hints = mutableMapOf<DecodeHintType, Any>()
                hints[DecodeHintType.TRY_HARDER] = true
                hints[DecodeHintType.POSSIBLE_FORMATS] = listOf(BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39)

                val result = reader.decode(binaryBitmap, hints)
                return result.text
            } catch (e: Exception) {
                e.printStackTrace()
                return null
            }
        }
    }
}