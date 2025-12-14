@echo off
echo 强制启动应用并启用CORS配置...

REM 设置Maven路径
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

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
echo 步骤3: 启动应用...
echo 使用强制CORS配置启动...
echo.

REM 添加JVM参数确保CORS配置生效
call mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev -Dserver.servlet.context-path=/"

pause