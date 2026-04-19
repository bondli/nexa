package com.bondli.nexa.app

/**
 * 用独立单例持有分享 URL，避免 MainActivity 直接依赖 ShareModule 类加载顺序
 */
object ShareStore {
    @Volatile
    var pendingShareUrl: String? = null
}
