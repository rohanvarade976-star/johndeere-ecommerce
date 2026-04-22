
# ════════════════════════════════════════════════════════════
#  John Deere E-Commerce Parts Diagram System
#  Windows PowerShell Setup Script
#  Run: Right-click → Run with PowerShell (as Administrator)
# ════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  John Deere E-Commerce Parts Diagram System  ║" -ForegroundColor Green
Write-Host "  ║  Setup Script v4.0                           ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# === STEP 1: Check Node.js ===
Write-Host "► Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install from https://nodejs.org" -ForegroundColor Red
    exit
}

# === STEP 2: Check MySQL ===
Write-Host "► Checking MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "  ✓ MySQL found" -ForegroundColor Green
} catch {
    Write-Host "  ✗ MySQL not found! Please install MySQL from https://dev.mysql.com/downloads/installer/" -ForegroundColor Red
    exit
}

# === STEP 3: Database Setup ===
Write-Host ""
Write-Host "► Setting up database..." -ForegroundColor Yellow
Write-Host "  Enter your MySQL root password when prompted:" -ForegroundColor Cyan
Get-Content "database\schema.sql" | mysql -u root -p
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Database setup failed. Check your MySQL password." -ForegroundColor Red
    exit
}

# === STEP 4: Backend Setup ===
Write-Host ""
Write-Host "► Setting up backend..." -ForegroundColor Yellow
Set-Location backend
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created backend .env file" -ForegroundColor Green
    Write-Host "  ⚠  IMPORTANT: Open backend\.env and set your DB_PASSWORD!" -ForegroundColor Yellow
}
Write-Host "  Installing backend packages..."
npm install --silent
Write-Host "  ✓ Backend ready!" -ForegroundColor Green
Set-Location ..

# === STEP 5: Frontend Setup ===
Write-Host ""
Write-Host "► Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created frontend .env file" -ForegroundColor Green
}
Write-Host "  Installing frontend packages (this may take 2-3 minutes)..."
npm install --silent
Write-Host "  ✓ Frontend ready!" -ForegroundColor Green
Set-Location ..

# === DONE ===
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  Setup complete!                             ║" -ForegroundColor Green
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  1. Edit backend\.env → set DB_PASSWORD      ║" -ForegroundColor White
Write-Host "  ║  2. In terminal 1: cd backend && npm run dev ║" -ForegroundColor White
Write-Host "  ║  3. In terminal 2: cd frontend && npm start  ║" -ForegroundColor White
Write-Host "  ║  4. Open: http://localhost:3000              ║" -ForegroundColor White
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  Admin: admin@johndeere-parts.com            ║" -ForegroundColor Cyan
Write-Host "  ║  Pass:  Password@123                         ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
