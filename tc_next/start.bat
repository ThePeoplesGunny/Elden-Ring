@echo off
REM Tarnished's Companion — Windows launcher.
REM Tries Python first (lighter), falls back to Node, errors clearly if neither.

where python >nul 2>nul
if %errorlevel% == 0 (
    python "%~dp0start.py" %*
    exit /b %errorlevel%
)

where node >nul 2>nul
if %errorlevel% == 0 (
    node "%~dp0start.js" %*
    exit /b %errorlevel%
)

echo.
echo Tarnished's Companion requires either Python 3.7+ or Node.js.
echo.
echo   Python: https://www.python.org/downloads/
echo   Node:   https://nodejs.org/en/download/
echo.
echo After installing, re-run start.bat.
pause
exit /b 1
