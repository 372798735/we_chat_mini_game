@echo off
echo Compiling and starting Spring Boot application...

REM 设置Maven路径
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo Compiling project...
call mvn clean compile -DskipTests

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo.
echo Starting application...
call mvn spring-boot:run

pause