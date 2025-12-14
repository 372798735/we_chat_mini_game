@echo off
echo Starting application with Flyway database fix...

echo Step 1: Clean and compile the project...
call mvn clean compile -DskipTests

if %ERRORLEVEL% neq 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo Step 2: Start with Flyway clean option...
call mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.flyway.clean-disabled=false -Dspring.flyway.clean=true"

echo Application started successfully!