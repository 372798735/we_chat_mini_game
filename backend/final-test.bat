@echo off
echo ========================================
echo 番茄闹钟后端应用最终启动测试
echo ========================================
echo.

REM 设置环境变量
echo 设置环境变量...
set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo 当前目录: %CD%
echo.

echo ========================================
echo 步骤1: 验证Java版本
echo ========================================
java -version
if %ERRORLEVEL% neq 0 (
    echo Java未找到或版本错误！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 步骤2: 清理并编译项目
echo ========================================
call mvn clean compile -q
if %ERRORLEVEL% neq 0 (
    echo 编译失败！检查上面的错误信息。
    pause
    exit /b 1
) else (
    echo ✅ 编译成功！
)

echo.
echo ========================================
echo 步骤3: 启动Spring Boot应用
echo ========================================
echo 应用将在30秒后自动停止，这是用于测试配置是否正常
echo.
echo 如果看到以下信息，说明启动成功：
echo - "Started TodoApplication"
echo - "Netty started on port 8080"
echo - "Tomcat started on port(s): 8080"
echo.

REM 使用timeout创建一个后台进程来停止应用
start /b cmd /c "echo 等待30秒后自动停止... && timeout /t 30 /nobreak > nul && echo 正在停止应用... && taskkill /F /IM java.exe > nul 2>&1"

echo 启动应用...
call mvn spring-boot:run -Dspring-boot.run.fork=false

echo.
echo ========================================
echo 测试完成！
echo ========================================
pause