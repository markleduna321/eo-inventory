# Production Deployment Script
# This script handles common deployment conflicts

Write-Host "Starting production deployment..." -ForegroundColor Green

# Step 1: Backup current state
Write-Host "Creating backup..." -ForegroundColor Yellow
git stash push -m "Production deployment backup $(Get-Date)"

# Step 2: Force pull from origin
Write-Host "Forcing clean pull..." -ForegroundColor Yellow
git reset --hard HEAD
git clean -fd
git pull origin deathwish --force

# Step 3: Handle migration conflicts
Write-Host "Checking for migration conflicts..." -ForegroundColor Yellow
if (Test-Path "database/migrations/2025_08_25_134854_modify_assignee_id_to_text_in_device_requests_table.php") {
    Write-Host "Migration file exists - proceeding with deployment" -ForegroundColor Green
} else {
    Write-Host "Migration file missing - this may cause issues" -ForegroundColor Red
}

# Step 4: Run production commands
Write-Host "Running production updates..." -ForegroundColor Yellow
composer install --no-dev --optimize-autoloader
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Step 5: Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
php artisan migrate --force

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Please verify your application is working correctly." -ForegroundColor Cyan
