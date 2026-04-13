package com.bondli.cashier.app

import android.util.Log
import com.facebook.react.bridge.*
import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.SQLException
import java.util.Properties

class MySQLModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "MySQLModule"
    }

    private var connection: Connection? = null

    override fun getName(): String {
        return "MySQLManager"
    }

    /**
     * 连接到 MySQL 数据库
     * @param host 数据库主机地址
     * @param port 数据库端口
     * @param database 数据库名称
     * @param username 用户名
     * @param password 密码
     * @param promise Promise 对象
     */
    @ReactMethod
    fun connect(host: String, port: Int, database: String, username: String, password: String, promise: Promise) {
        Thread {
            try {
                Log.d(TAG, "Attempting to connect to MySQL database at $host:$port/$database with user $username")
                
                // 加载 MySQL 驱动 - 使用5.x版本的驱动类名，添加更好的错误处理
                try {
                    Class.forName("com.mysql.jdbc.Driver")
                    Log.d(TAG, "MySQL Driver loaded successfully")
                } catch (e: ClassNotFoundException) {
                    Log.e(TAG, "MySQL Driver not found", e)
                    promise.reject("E_DRIVER_NOT_FOUND", "MySQL Driver not found: ${e.message}")
                    return@Thread
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to load MySQL Driver", e)
                    promise.reject("E_DRIVER_LOAD_FAILED", "Failed to load MySQL Driver: ${e.message}")
                    return@Thread
                }
                
                // 构建连接 URL - 简化配置，减少可能的冲突
                val url = "jdbc:mysql://$host:$port/$database?useSSL=false&allowPublicKeyRetrieval=true&autoReconnect=true&useUnicode=true&characterEncoding=utf8"
                Log.d(TAG, "Connection URL: $url")
                
                // 设置连接属性 - 简化配置
                val props = Properties()
                props.setProperty("user", username)
                props.setProperty("password", password)
                props.setProperty("zeroDateTimeBehavior", "convertToNull")
                props.setProperty("autoReconnect", "true")
                props.setProperty("failOverReadOnly", "false")
                props.setProperty("maxReconnects", "3")
                props.setProperty("connectTimeout", "10000")
                props.setProperty("socketTimeout", "30000")
                
                // 建立连接
                connection = DriverManager.getConnection(url, props)
                
                Log.d(TAG, "Connected to MySQL database successfully")
                promise.resolve("Connected to MySQL database successfully")
            } catch (e: SQLException) {
                Log.e(TAG, "SQL Exception during connection", e)
                promise.reject("E_SQL_CONNECTION_FAILED", "SQL Exception during connection: ${e.message}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to connect to MySQL database at $host:$port/$database with user $username", e)
                promise.reject("E_CONNECTION_FAILED", "Failed to connect to MySQL database: ${e.message}")
            }
        }.start()
    }

    /**
     * 执行查询语句
     * @param query SQL 查询语句
     * @param promise Promise 对象
     */
    @ReactMethod
    fun executeQuery(query: String, promise: Promise) {
        Thread {
            try {
                val conn = connection
                if (conn == null || conn.isClosed) {
                    Log.e(TAG, "Not connected to database")
                    promise.reject("E_NO_CONNECTION", "Not connected to database")
                    return@Thread
                }

                Log.d(TAG, "Executing query: $query")
                val statement = conn.createStatement()
                val resultSet = statement.executeQuery(query)
                
                // 将结果集转换为 React Native 可用的格式
                val resultArray = convertResultSetToArray(resultSet)
                
                statement.close()
                Log.d(TAG, "Query executed successfully, returned ${resultArray.size()} rows")
                promise.resolve(resultArray)
            } catch (e: SQLException) {
                Log.e(TAG, "Failed to execute query: $query", e)
                promise.reject("E_QUERY_FAILED", "Failed to execute query: ${e.message}")
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error during query execution", e)
                promise.reject("E_UNEXPECTED_ERROR", "Unexpected error: ${e.message}")
            }
        }.start()
    }

    /**
     * 执行更新语句（INSERT, UPDATE, DELETE）
     * @param query SQL 更新语句
     * @param promise Promise 对象
     */
    @ReactMethod
    fun executeUpdate(query: String, promise: Promise) {
        Thread {
            try {
                val conn = connection
                if (conn == null || conn.isClosed) {
                    Log.e(TAG, "Not connected to database")
                    promise.reject("E_NO_CONNECTION", "Not connected to database")
                    return@Thread
                }

                Log.d(TAG, "Executing update: $query")
                val statement = conn.createStatement()
                val affectedRows = statement.executeUpdate(query)
                
                statement.close()
                Log.d(TAG, "Update executed successfully, affected $affectedRows rows")
                promise.resolve(affectedRows)
            } catch (e: SQLException) {
                Log.e(TAG, "Failed to execute update: $query", e)
                promise.reject("E_UPDATE_FAILED", "Failed to execute update: ${e.message}")
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error during update execution", e)
                promise.reject("E_UNEXPECTED_ERROR", "Unexpected error: ${e.message}")
            }
        }.start()
    }

    /**
     * 关闭数据库连接
     * @param promise Promise 对象
     */
    @ReactMethod
    fun disconnect(promise: Promise) {
        Thread {
            try {
                if (connection != null && !connection!!.isClosed) {
                    connection?.close()
                    Log.d(TAG, "Disconnected from MySQL database")
                } else {
                    Log.d(TAG, "No active database connection to close")
                }
                connection = null
                promise.resolve("Disconnected from MySQL database")
            } catch (e: SQLException) {
                Log.e(TAG, "Failed to disconnect from database", e)
                promise.reject("E_DISCONNECT_FAILED", "Failed to disconnect from database: ${e.message}")
            }
        }.start()
    }

    /**
     * 将 ResultSet 转换为 React Native 可用的数组
     * @param rs ResultSet 对象
     * @return WritableArray 包含查询结果的数组
     */
    private fun convertResultSetToArray(rs: ResultSet): WritableArray {
        val resultArray = Arguments.createArray()
        val columnCount = rs.metaData.columnCount

        while (rs.next()) {
            val rowObject = Arguments.createMap()
            for (i in 1..columnCount) {
                val columnName = rs.metaData.getColumnName(i)
                val columnValue = rs.getObject(i)
                when (columnValue) {
                    is String -> rowObject.putString(columnName, columnValue)
                    is Int -> rowObject.putInt(columnName, columnValue)
                    is Long -> rowObject.putDouble(columnName, columnValue.toDouble())
                    is Double -> rowObject.putDouble(columnName, columnValue)
                    is Float -> rowObject.putDouble(columnName, columnValue.toDouble())
                    is Boolean -> rowObject.putBoolean(columnName, columnValue)
                    null -> rowObject.putNull(columnName)
                    else -> rowObject.putString(columnName, columnValue.toString())
                }
            }
            resultArray.pushMap(rowObject)
        }

        return resultArray
    }
}