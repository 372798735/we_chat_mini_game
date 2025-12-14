@echo off
echo Testing compilation with Java...

set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%

echo Java version:
java -version

echo.
echo Checking if we can at least compile the main class...
cd /d "d:\project\we_chat_mini_game\backend"

if not exist "target\classes" mkdir "target\classes"

echo Attempting to compile main application class...
javac -cp "target\classes" -d "target\classes" "src\main\java\com\tomato\todo\backend\TodoApplication.java"

if %errorlevel% equ 0 (
    echo SUCCESS: Main class compiled successfully
) else (
    echo ERROR: Main class compilation failed
)

pause