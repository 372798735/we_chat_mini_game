@echo off
echo Starting Spring Boot application...

REM 设置Java路径
set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

REM 进入项目目录
cd /d "%~dp0"

echo Using Java:
java -version

echo.
echo Starting application with Flyway disabled...
echo Once application starts successfully, you can re-enable Flyway in application.yml
echo.

REM 启动应用
java -jar target\*.jar --spring.flyway.enabled=false

pause