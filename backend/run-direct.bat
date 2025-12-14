@echo off
echo 直接运行Spring Boot应用...

REM 设置Java路径
set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

REM 检查是否有编译的classes
if not exist "target\classes\com\tomato\todo\backend\TodoApplication.class" (
    echo 没有找到编译的classes，尝试快速编译...

    REM 创建简单的classpath
    if not exist "target\classes" mkdir "target\classes"

    echo 正在编译主要源文件...
    dir /s /b src\main\java\*.java > sources.txt

    "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\javac.exe" -d "target\classes" -cp "target\classes" @sources.txt

    if %ERRORLEVEL% neq 0 (
        echo 编译失败，尝试下载依赖...
        goto download_deps
    )

    del sources.txt
) else (
    echo 找到编译的classes
)

:download_deps
REM 检查是否有Spring Boot核心依赖
if not exist "target\dependency\spring-boot-*.jar" (
    echo 没有找到Spring Boot依赖，创建简化版本...
    goto simple_test
)

:simple_test
echo.
echo 尝试直接运行主应用类...
echo.

REM 设置classpath
set CLASSPATH=target\classes

REM 如果有依赖，添加到classpath
if exist "target\dependency\*.jar" (
    set CLASSPATH=%CLASSPATH%;target\dependency\*
)

echo CLASSPATH: %CLASSPATH%

REM 尝试运行应用
"C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot\bin\java.exe" -cp "%CLASSPATH%" com.tomato.todo.backend.TodoApplication --server.port=8080 --spring.profiles.active=simple

if %ERRORLEVEL% neq 0 (
    echo.
    echo 直接运行失败，错误代码: %ERRORLEVEL%
    echo.
    echo 可能的原因：
    echo 1. 缺少Spring Boot依赖jar包
    echo 2. 类路径配置不正确
    echo 3. 数据库连接问题
    echo.
    echo 建议安装Maven后重新编译运行：
    echo choco install maven
    echo mvn spring-boot:run
    echo.
)

pause