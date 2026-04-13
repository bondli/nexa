# React Native & Hermes rules
-keep class com.facebook.react.** { *; }
-keepclassmembers,includedescriptorclasses class * {
    native <methods>;
}
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# MySQL Connector/J rules
-keep class com.mysql.** { *; }
-keep class com.mysql.jdbc.** { *; }
-dontwarn com.mysql.**
-dontwarn com.mysql.jdbc.**
-keep class javax.security.sasl.** { *; }
-dontwarn javax.security.sasl.**

# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile