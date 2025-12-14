@echo off
echo Quick test for Spring Boot configuration...

REM 设置环境变量
set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%JAVA_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo.
echo Testing compilation first...
call mvn compile -q -DskipTests

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo.
echo Compilation successful! Now testing application startup...
echo Application will start for 30 seconds to check for configuration errors.
echo.

REM 启动应用并在30秒后自动停止
timeout /t 30 /nobreak > nul & echo "Stopping test..." & taskkill /F /IM java.exe > nul 2>&1

call mvn spring-boot:run -Dspring-boot.run.fork=false -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=test"

pause