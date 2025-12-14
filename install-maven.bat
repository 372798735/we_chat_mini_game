@echo off
echo Installing Maven for Windows...

set MAVEN_VERSION=3.9.6
set MAVEN_URL=https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip
set DOWNLOAD_DIR=%TEMP%
set INSTALL_DIR=C:\Program Files\Apache\maven

echo Downloading Maven %MAVEN_VERSION%...
powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%DOWNLOAD_DIR%\maven.zip'"

if %errorlevel% neq 0 (
    echo ERROR: Failed to download Maven
    pause
    exit /b 1
)

echo Extracting Maven...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
powershell -Command "Expand-Archive -Path '%DOWNLOAD_DIR%\maven.zip' -DestinationPath '%INSTALL_DIR%' -Force"

if %errorlevel% neq 0 (
    echo ERROR: Failed to extract Maven
    pause
    exit /b 1
)

echo Adding Maven to PATH...
setx MAVEN_HOME "%INSTALL_DIR%\apache-maven-%MAVEN_VERSION%" /M
setx PATH "%PATH%;%MAVEN_HOME%\bin" /M

echo Maven installation completed!
echo Maven location: %INSTALL_DIR%\apache-maven-%MAVEN_VERSION%
echo.
echo Testing Maven installation...
"%INSTALL_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn" -version

echo.
echo Please restart your command prompt to use Maven.
pause