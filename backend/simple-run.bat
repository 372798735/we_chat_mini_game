@echo off
echo Simple Java test for TodoApplication...

set JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
set PATH=%JAVA_HOME%\bin;%PATH%
set CLASSPATH="target\classes"

echo Java version:
java -version

echo.
echo Attempting to run TodoApplication...
echo (This will likely fail due to missing dependencies, but we can see if compilation issues are resolved)

cd /d "d:\project\we_chat_mini_game\backend"
java -cp %CLASSPATH% com.tomato.todo.backend.TodoApplication --help

echo.
echo Test completed. If we get "class not found" or "NoClassDefFoundError", it means
echo compilation is working but dependencies are missing, which is expected.

pause