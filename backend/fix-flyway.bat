@echo off
echo Fixing Flyway database migration issues...

echo Step 1: Dropping and recreating database...
mysql -u root -proot -e "DROP DATABASE IF EXISTS tomato_todo_dev; CREATE DATABASE tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo Step 2: Starting Spring Boot application with clean database...
cd /d "%~dp0"
mvn spring-boot:run -Dspring.flyway.clean-disabled=false -Dspring.flyway.clean=true

echo Flyway fix completed!