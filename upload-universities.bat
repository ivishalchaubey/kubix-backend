@echo off
REM University Data Upload Script Runner for Windows

echo ================================================================
echo          KUBIX - University Data Upload Script
echo ================================================================
echo.

echo Checking if backend server is running...
curl -s http://localhost:5001 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Backend server is NOT running on port 5001
    echo.
    echo Please start your backend server first:
    echo   npm run dev
    echo   or
    echo   yarn dev
    echo.
    pause
    exit /b 1
)

echo SUCCESS: Backend server is running
echo.
echo IMPORTANT REMINDERS:
echo   1. Ensure your MongoDB is connected
echo   2. Verify your admin token is valid
echo   3. Check the API_URL in data.js (localhost vs production)
echo.

set /p CONFIRM="Do you want to proceed with the upload? (y/n): "
if /i "%CONFIRM%" neq "y" (
    echo.
    echo Upload cancelled
    pause
    exit /b 0
)

echo.
echo Starting university data upload...
echo.

REM Check if bun is available, otherwise use node
where bun >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Bun for faster execution...
    bun data.js
) else (
    echo Using Node.js...
    node data.js
)

echo.
echo Upload script completed!
pause

