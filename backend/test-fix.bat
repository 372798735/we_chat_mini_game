@echo off
echo Testing Spring Boot application startup...

REM 设置Maven路径
set MAVEN_HOME="C:\Program Files\Apache\maven\apache-maven-3.9.6"
set PATH=%MAVEN_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo.
echo Starting application with fixed configuration...
echo.

REM 启动Spring Boot应用
call mvn spring-boot:run -Dspring-boot.run.fork=false

pause