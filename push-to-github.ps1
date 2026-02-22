# Run this script in PowerShell from the project folder (Medntel) to push to GitHub.
# Prerequisites: Git installed (https://git-scm.com/download/win)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1. Init and first commit (only if not already a repo)
if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: MediSense healthcare report analysis app"
    Write-Host "Git repo initialized and first commit created." -ForegroundColor Green
} else {
    git add .
    $status = git status --short
    if ($status) {
        git commit -m "Update: MediSense project files"
        Write-Host "Changes committed." -ForegroundColor Green
    } else {
        Write-Host "Nothing to commit (working tree clean)." -ForegroundColor Yellow
    }
}

# 2. Remind user to create repo on GitHub and set remote
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repo at https://github.com/new (name e.g. MediSense)"
Write-Host "2. Do NOT add README (we already have one)"
Write-Host "3. Run these commands (replace YOUR_USERNAME and YOUR_REPO with your details):"
Write-Host ""
Write-Host '   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git' -ForegroundColor White
Write-Host '   git branch -M main' -ForegroundColor White
Write-Host '   git push -u origin main' -ForegroundColor White
Write-Host ""

# If you already created the repo, uncomment and set the URL below, then run again:
# git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
# git branch -M main
# git push -u origin main
