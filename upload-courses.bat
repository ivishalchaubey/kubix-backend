@echo off
REM ============================================
REM Course Upload Script for Windows
REM ============================================

echo ╔════════════════════════════════════════════════════════════╗
echo ║           Course Bulk Upload - Kubix Backend              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if all-cources-data.json exists
if not exist "all-cources-data.json" (
    echo ❌ Error: all-cources-data.json file not found!
    echo Please ensure the file exists in the current directory.
    pause
    exit /b 1
)

echo ✅ Found all-cources-data.json
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version
echo.

REM Check if server is running (Windows version)
echo 🔍 Checking if server is running on port 5001...
netstat -ano | findstr ":5001" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Server is running
) else (
    echo ⚠️  Warning: Server doesn't appear to be running on port 5001
    echo Please start your server with: npm run dev
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo.
echo 🚀 Starting course upload process...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Run the upload script
node upload-courses.js

REM Capture exit code
set EXIT_CODE=%ERRORLEVEL%

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if %EXIT_CODE% EQU 0 (
    echo ✅ Upload completed successfully!
) else (
    echo ❌ Upload encountered errors (Exit code: %EXIT_CODE%^)
)

echo.
echo Script finished at: %date% %time%
echo.

pause
exit /b %EXIT_CODE%


