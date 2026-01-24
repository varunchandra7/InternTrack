# Quick Deploy Script for InternTrack

Write-Host "🚀 InternTrack - Quick Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit
}

Write-Host "✅ Git is installed" -ForegroundColor Green

# Initialize git if not already done
if (!(Test-Path ".git")) {
    Write-Host "`n📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Create .gitignore if it doesn't exist
Write-Host "`n📝 Checking .gitignore..." -ForegroundColor Yellow
if (!(Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
}
Write-Host "✅ .gitignore configured" -ForegroundColor Green

# Stage all files
Write-Host "`n📦 Staging files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "`n💾 Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit - InternTrack application ready for deployment"

Write-Host "`n✅ Repository is ready for deployment!`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Create a GitHub repository:" -ForegroundColor Yellow
Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: interntrack" -ForegroundColor White
Write-Host "   - Create repository`n" -ForegroundColor White

Write-Host "2. Push your code:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/interntrack.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main`n" -ForegroundColor White

Write-Host "3. Deploy Backend:" -ForegroundColor Yellow
Write-Host "   - Visit: https://render.com" -ForegroundColor White
Write-Host "   - Sign in with GitHub" -ForegroundColor White
Write-Host "   - Follow steps in DEPLOYMENT_GUIDE.md`n" -ForegroundColor White

Write-Host "4. Deploy Frontend:" -ForegroundColor Yellow
Write-Host "   - Visit: https://vercel.com" -ForegroundColor White
Write-Host "   - Import your GitHub repository" -ForegroundColor White
Write-Host "   - Deploy!`n" -ForegroundColor White

Write-Host "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "`n🎉 Good luck with your deployment!" -ForegroundColor Green
