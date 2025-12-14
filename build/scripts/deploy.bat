@echo off
chcp 65001 >nul

echo ==========================================
echo 番茄闹钟待办清单 - Windows 部署脚本
echo ==========================================

:: 设置变量
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%\..
set DIST_DIR=%PROJECT_ROOT%\..\dist
set DEPLOY_DIR=C:\tomato-todo
set SERVICE_NAME=TomatoTodoService
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 开始部署番茄闹钟待办清单...
echo 部署目标: %DEPLOY_DIR%
echo 部署时间: %date% %time%
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 此脚本需要管理员权限运行
    echo 请以管理员身份运行此脚本
    pause
    exit /b 1
)

:: 检查构建文件
if not exist "%DIST_DIR%" (
    echo 错误: 构建目录不存在: %DIST_DIR%
    echo 请先运行构建脚本: build.bat
    pause
    exit /b 1
)

if not exist "%DIST_DIR%\backend\*.jar" (
    echo 错误: 后端 JAR 文件不存在
    pause
    exit /b 1
)

echo 构建文件检查通过
echo.

:: 停止现有服务
echo 停止现有服务...
sc query "%SERVICE_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    sc stop "%SERVICE_NAME%" >nul 2>&1
    echo 服务已停止
) else (
    echo 未找到运行中的服务
)

:: 等待服务完全停止
timeout /t 3 /nobreak >nul

:: 创建部署目录
if not exist "%DEPLOY_DIR%" (
    mkdir "%DEPLOY_DIR%"
)
if not exist "%DEPLOY_DIR%\logs" (
    mkdir "%DEPLOY_DIR%\logs"
)
if not exist "%DEPLOY_DIR%\config" (
    mkdir "%DEPLOY_DIR%\config"
)

:: 部署应用文件
echo 部署应用文件...
xcopy "%DIST_DIR%\backend\*" "%DEPLOY_DIR%\" /E /Y /Q >nul
if exist "%DIST_DIR%\frontend" (
    xcopy "%DIST_DIR%\frontend\*" "%DEPLOY_DIR%\frontend\" /E /Y /Q >nul
)
if exist "%DIST_DIR%\database" (
    xcopy "%DIST_DIR%\database\*" "%DEPLOY_DIR%\database\" /E /Y /Q >nul
)

echo 应用文件部署完成
echo.

:: 创建 Windows 服务
echo 创建 Windows 服务...

:: 删除现有服务（如果存在）
sc query "%SERVICE_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    sc delete "%SERVICE_NAME%" >nul 2>&1
    echo 现有服务已删除
)

:: 创建服务
set JAVA_PATH=java
set JAR_FILE=%DEPLOY_DIR%\*.jar
set LOG_FILE=%DEPLOY_DIR%\logs\service.log

sc create "%SERVICE_NAME%" ^
    binPath= "\"%JAVA_PATH%\" -Xms512m -Xmx2g -server -Dspring.profiles.active=prod -jar \"%JAR_FILE%\" --spring.config.location=file:%DEPLOY_DIR%\config\application-prod.yml" ^
    start= auto ^
    DisplayName= "番茄闹钟待办清单服务" ^
    depend= Tcpip

if %errorlevel% equ 0 (
    echo Windows 服务创建成功
) else (
    echo 错误: Windows 服务创建失败
    pause
    exit /b 1
)

:: 配置服务恢复选项
sc failure "%SERVICE_NAME%" reset= 86400 actions= restart/5000/restart/10000/restart/20000

echo 服务配置完成
echo.

:: 启动服务
echo 启动服务...
sc start "%SERVICE_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo 服务启动成功
) else (
    echo 错误: 服务启动失败
    sc query "%SERVICE_NAME%"
    pause
    exit /b 1
)

:: 等待服务启动
timeout /t 5 /nobreak >nul

:: 健康检查
echo 执行健康检查...
sc query "%SERVICE_NAME%" | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo 服务状态正常
) else (
    echo 错误: 服务未正常运行
    sc query "%SERVICE_NAME%"
    pause
    exit /b 1
)

:: 检查端口
netstat -an | find ":8080" >nul
if %errorlevel% equ 0 (
    echo 后端服务端口 8080 正常监听
) else (
    echo 警告: 后端服务端口 8080 未监听
)

:: 配置防火墙规则（可选）
echo 配置防火墙规则...
netsh advfirewall firewall show rule name="%SERVICE_NAME%" >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name="%SERVICE_NAME%" dir=in action=allow protocol=TCP localport=8080 >nul
    echo 防火墙规则已添加
)

echo.
echo ==========================================
echo 部署完成！
echo ==========================================
echo.
echo 服务地址: http://localhost
echo API地址: http://localhost/api
echo.
echo 服务管理:
echo   启动: sc start "%SERVICE_NAME%"
echo   停止: sc stop "%SERVICE_NAME%"
echo   重启: sc stop "%SERVICE_NAME%" && sc start "%SERVICE_NAME%"
echo   删除: sc delete "%SERVICE_NAME%"
echo   状态: sc query "%SERVICE_NAME%"
echo   日志: type "%DEPLOY_DIR%\logs\service.log"
echo.
echo 如需查看实时日志:
echo   powershell -Command "Get-Content '%DEPLOY_DIR%\logs\service.log' -Tail -Wait"
echo.

pause