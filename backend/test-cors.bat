@echo off
echo 测试CORS配置...

REM 设置Maven路径
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo.
echo 步骤1: 清理编译缓存...
call mvn clean

if %ERRORLEVEL% neq 0 (
    echo 清理失败!
    pause
    exit /b 1
)

echo.
echo 步骤2: 编译项目...
call mvn compile -DskipTests

if %ERRORLEVEL% neq 0 (
    echo 编译失败!
    pause
    exit /b 1
)

echo.
echo 步骤3: 启动应用进行CORS测试...
echo 应用启动后，请访问以下URL测试：
echo - 测试端点: http://localhost:8080/api/test/cors
echo - 任务列表: http://localhost:8080/api/tasks
echo.
echo 按 Ctrl+C 停止应用
echo.

REM 启动Spring Boot应用
call mvn spring-boot:run

pause