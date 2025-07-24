Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Genesis Crosshairs - Windows Build" -ForegroundColor Cyan  
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
npm install electron electron-builder --save-dev

Write-Host ""
Write-Host "Building React application..." -ForegroundColor Yellow
npm run build:client

Write-Host ""
Write-Host "Creating Windows EXE..." -ForegroundColor Yellow
npm run dist:win

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your EXE installer is located in:" -ForegroundColor White
Write-Host "release/Genesis Crosshairs Setup 1.0.0.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "Double-click the installer to install the gaming overlay!" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
