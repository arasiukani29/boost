# FurniNest Quick Launch Script
Write-Host "Starting FurniNest Backend (.NET Web API on port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'FurniNest Backend Starting...' -ForegroundColor Green; dotnet run"

Start-Sleep -Seconds 3

Write-Host "Starting FurniNest Frontend (Angular 21 on port 4200)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'FurniNest Frontend Starting...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  FurniNest is launching!" -ForegroundColor Yellow
Write-Host "  - Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend App: http://localhost:4200" -ForegroundColor White
Write-Host "  - Customer: customer@furninest.com / Customer@123" -ForegroundColor White
Write-Host "  - Admin:    admin@furninest.com    / Admin@123" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green

