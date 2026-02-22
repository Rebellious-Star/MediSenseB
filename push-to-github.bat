@echo off
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
    echo Git not found. Install from https://git-scm.com/download/win
    pause
    exit /b 1
)

if not exist .git (
    git init
    git add .
    git commit -m "Initial commit: MediSense healthcare report analysis app"
    echo Git repo initialized and first commit created.
) else (
    git add .
    git commit -m "Update: MediSense project files" 2>nul || echo Nothing to commit.
)

echo.
echo Next: Create a repo at https://github.com/new then run:
echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo   git branch -M main
echo   git push -u origin main
echo.
pause
