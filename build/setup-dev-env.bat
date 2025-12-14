@echo off
echo ========================================
echo 番茄闹钟待办清单 - 开发环境设置
echo ========================================
echo.

echo [1/5] 检查 Node.js 版本...
node --version
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js 16+ 版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/5] 检查 Java 版本...
java -version
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Java，请先安装 Java 17+ 版本
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
)

echo.
echo [3/5] 检查 Maven 版本...
mvn -version
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Maven，请先安装 Maven 3.8+ 版本
    echo 下载地址: https://maven.apache.org/
    pause
    exit /b 1
)

echo.
echo [4/5] 创建开发数据库...
echo 请确保 MySQL 服务正在运行
echo.

echo 创建数据库...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo ❌ 错误: 数据库创建失败，请检查 MySQL 配置
    pause
    exit /b 1
)

echo 创建用户并授权...
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'tomato_todo'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON tomato_todo_dev.* TO 'tomato_todo'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

echo ✅ 数据库配置完成

echo.
echo [5/5] 安装项目依赖...
echo.
echo 安装前端依赖...
cd /d %~dp0\frontend
npm install
if %errorlevel%neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo.
echo 安装后端依赖...
cd /d %~dp0\backend
mvn clean install -DskipTests
if %errorlevel%neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 开发环境配置完成！
echo ========================================
echo.
echo 🎉 下一步操作：
echo 1. 启动后端服务: cd backend && mvn spring-boot:run
echo 2. 启动前端开发: cd frontend && npm run dev
echo 3. 访问应用: http://localhost:5173
echo 4. API文档: http://localhost:8080/api/swagger-ui.html
echo.
pause