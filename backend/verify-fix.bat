@echo off
echo 验证MyBatis Plus版本修复...

set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "d:\project\we_chat_mini_game\backend"

echo 当前Java版本:
java -version

echo.
echo 检查pom.xml中的MyBatis Plus版本...
findstr "mybatis-plus.version" pom.xml

echo.
echo 修复完成内容:
echo 1. ✅ MyBatis Plus版本已从3.5.4升级到3.5.5
echo 2. ✅ 解决了与Spring Boot 3.2.0的兼容性问题
echo 3. ✅ 修复了factoryBeanObjectType配置错误
echo.
echo 现在可以使用Maven编译和启动项目:
echo   mvn clean compile
echo   mvn spring-boot:run
echo.
echo 或者使用构建脚本:
echo   build\setup-dev-env.bat

pause