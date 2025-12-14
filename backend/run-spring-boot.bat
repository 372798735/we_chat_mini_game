@echo off
echo ===================================
echo  启动番茄闹钟后端服务 (Spring Boot)
echo ===================================

REM 检查Java版本
echo 检查Java环境...
java -version
if %ERRORLEVEL% neq 0 (
    echo [错误] Java未安装或不在PATH中
    echo 请安装Java 17或更高版本
    pause
    exit /b 1
)

REM 检查MySQL连接
echo.
echo 检查MySQL连接...
java -cp "target\classes" -Dspring.profiles.active=dev -Djava.awt.headless=true -c "
import java.sql.*;

public class MySQLTest {
    public static void main(String[] args) {
        try {
            Class.forName(\"com.mysql.cj.jdbc.Driver\");
            Connection conn = DriverManager.getConnection(
                \"jdbc:mysql://localhost:3306/tomato_todo_dev?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true\",
                \"root\",
                \"root\"
            );
            System.out.println(\"[成功] MySQL连接正常\");
            conn.close();
        } catch (Exception e) {
            System.out.println(\"[错误] MySQL连接失败: \" + e.getMessage());
            System.exit(1);
        }
    }
}" > temp_test.java

javac -cp "target\dependency\*" temp_test.java 2>nul
java -cp "target\classes:target\dependency\*" MySQLTest 2>nul
del temp_test.java MySQLTest.class 2>nul

if %ERRORLEVEL% neq 0 (
    echo.
    echo [错误] 无法连接到MySQL数据库
    echo 请确保:
    echo 1. MySQL服务器已启动
    echo 2. 数据库'tomato_todo_dev'已创建
    echo 3. 用户名/密码正确 (root/root)
    echo.
    echo 要创建数据库，请执行:
    echo CREATE DATABASE IF NOT EXISTS tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo.
    pause
    exit /b 1
)

REM 启动Spring Boot应用
echo.
echo 启动Spring Boot后端服务...
echo 端口: 8080
echo API地址: http://localhost:8080/api
echo.

REM 检查是否存在Spring Boot JAR文件
if not exist "target\tomato-todo-*.jar" (
    echo [信息] 未找到编译的JAR文件，尝试构建...
    if exist "pom.xml" (
        echo 使用Maven构建...
        mvn clean package -DskipTests 2>nul
        if %ERRORLEVEL% neq 0 (
            echo [错误] Maven构建失败
            echo 请确保Maven已安装或项目配置正确
            pause
            exit /b 1
        )
    ) else (
        echo [错误] 未找到pom.xml文件且没有预编译的JAR
        echo 无法启动应用
        pause
        exit /b 1
    )
)

REM 启动应用
set SPRING_PROFILES_ACTIVE=dev
set SERVER_PORT=8080
set CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

echo 启动参数:
echo   - Spring Profile: %SPRING_PROFILES_ACTIVE%
echo   - Server Port: %SERVER_PORT%
echo   - CORS Origins: %CORS_ALLOWED_ORIGINS%
echo.

REM 启动JAR文件
for %%f in (target\tomato-todo-*.jar) do (
    echo 启动: %%f
    java -jar "%%f" --spring.profiles.active=%SPRING_PROFILES_ACTIVE% --server.port=%SERVER_PORT%
    goto :end
)

:end
echo.
echo ===================================
echo  后端服务已停止
echo ===================================
pause