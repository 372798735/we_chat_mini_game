@echo off
echo 启动应用 - CORS问题已修复版本...

REM 设置Maven路径
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo 检查Java和Maven环境...
echo Java版本:
java -version

echo Maven版本:
call mvn -version

echo.
echo 步骤1: 清理项目...
call mvn clean

if %ERRORLEVEL% neq 0 (
    echo 清理失败，请检查Maven环境配置
    pause
    exit /b 1
)

echo.
echo 步骤2: 编译项目...
call mvn compile -DskipTests

if %ERRORLEVEL% neq 0 (
    echo 编译失败，请检查代码错误
    pause
    exit /b 1
)

echo.
echo 步骤3: 启动应用...
echo 应用正在启动，CORS配置已修复...
echo 前端应该可以正常访问API了
echo.

REM 启动Spring Boot应用
call mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"

pause