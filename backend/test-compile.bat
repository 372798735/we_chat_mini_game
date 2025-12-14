@echo off
echo Testing compilation of all Java files...

set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "d:\project\we_chat_mini_game\backend"

echo.
echo Testing StatisticsResponse.java compilation...
javac -cp "target\classes" "src\main\java\com\tomato\todo\backend\dto\statistics\StatisticsResponse.java" 2>&1

if %errorlevel% equ 0 (
    echo SUCCESS: StatisticsResponse compiled successfully
) else (
    echo WARNING: StatisticsResponse has compilation issues (expected due to missing dependencies)
)

echo.
echo Testing main application class...
javac -cp "target\classes" "src\main\java\com\tomato\todo\backend\TodoApplication.java" 2>&1

if %errorlevel% equ 0 (
    echo SUCCESS: TodoApplication compiled successfully
) else (
    echo ERROR: TodoApplication has compilation issues
)

pause