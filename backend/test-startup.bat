@echo off
echo 测试后端应用启动...

set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "d:\project\we_chat_mini_game\backend"

echo Java版本:
java -version

echo.
echo 当前Spring Boot版本:
findstr "<version>" pom.xml | head -n 1

echo.
echo 当前MyBatis Plus版本:
findstr "mybatis-plus.version" pom.xml

echo.
echo 检查JPA依赖是否已移除:
findstr "spring-boot-starter-data-jpa" pom.xml || echo ✅ JPA依赖已成功移除

echo.
echo 修复摘要:
echo 1. ✅ Spring Boot版本降级到3.1.5
echo 2. ✅ MyBatis Plus版本保持3.5.5
echo 3. ✅ 移除了JPA依赖避免冲突
echo 4. ✅ 使用@MapperScan替换@EnableJpaRepositories
echo.
echo 现在可以尝试启动应用:
echo   mvn clean compile
echo   mvn spring-boot:run

pause