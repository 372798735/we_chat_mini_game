@echo off
echo 设置番茄闹钟待办清单数据库...

echo.
echo 正在检查MySQL服务是否运行...
sc query mysql 2>nul || sc query MySQL80 2>nul || sc query mariadb 2>nul
if %errorlevel% neq 0 (
    echo 警告: MySQL服务可能未运行，请确保MySQL已安装并启动
    echo 您可以:
    echo 1. 启动MySQL服务
    echo 2. 或者修改application.yml中的数据库连接配置
    echo.
)

echo.
echo 数据库连接信息:
echo 数据库名: tomato_todo_dev
echo 用户名: root
echo 密码: password (在application.yml中配置)
echo.
echo 如果MySQL root用户密码不是'password'，请:
echo 1. 修改MySQL root用户密码为'password'，或
echo 2. 修改backend/src/main/resources/application.yml中的password字段
echo.

echo 创建数据库...
mysql -u root -ppassword < setup-database.sql 2>nul
if %errorlevel% equ 0 (
    echo ✅ 数据库创建成功！
) else (
    echo ❌ 数据库创建失败，请检查MySQL连接
    echo 尝试不使用密码连接...
    mysql -u root < setup-database.sql 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 数据库创建成功（无密码连接）！
        echo 请更新application.yml，移除password字段
    ) else (
        echo ❌ 请手动连接MySQL并执行setup-database.sql中的内容
    )
)

echo.
echo 数据库设置完成！现在可以启动应用了。
echo 启动命令: mvn spring-boot:run

pause