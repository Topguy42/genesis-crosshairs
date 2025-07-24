@echo off
echo ====================================
echo Genesis Crosshairs - Windows Build
echo ====================================
echo.

echo Installing dependencies...
npm install
npm install electron electron-builder --save-dev

echo.
echo Building React application...
npm run build:client

echo.
echo Creating Windows EXE...
npm run dist:win

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
echo Your EXE installer is located in:
echo release/Genesis Crosshairs Setup 1.0.0.exe
echo.
echo Double-click the installer to install the gaming overlay!
echo.
pause
