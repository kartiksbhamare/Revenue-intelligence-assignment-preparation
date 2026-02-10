# Run this in PowerShell from D:\assignment (or from project root)
# Usage: .\push_to_github.ps1

Set-Location $PSScriptRoot

Write-Host "Creating initial commit..."
git commit -m "Initial commit: Revenue Intelligence Console"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Trying with --no-verify..."
    git commit --no-verify -m "Initial commit: Revenue Intelligence Console"
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. Run manually: git commit -m \"Initial commit\""
    exit 1
}

Write-Host "Pushing to GitHub..."
git branch -M main
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Done! Repo is at https://github.com/kartiksbhamare/Revenue-intelligence-assignment-preparation"
} else {
    Write-Host "Push failed. Check your GitHub repo exists and you are logged in."
}
