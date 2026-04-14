package com.bondli.nexa.app

import com.facebook.react.ReactActivity
import android.os.Bundle

class MainActivity : ReactActivity() {
    override fun getMainComponentName(): String? {
        return "NexaApp"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }
}