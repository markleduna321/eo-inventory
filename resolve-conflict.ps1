# Safe Production Conflict Resolution Script
# This script helps resolve the specific migration conflict

Write-Host "Resolving production migration conflict..." -ForegroundColor Green

# Step 1: Check current migration status
Write-Host "Checking migration status..." -ForegroundColor Yellow
php artisan migrate:status

# Step 2: Check if the problematic migration has been run
Write-Host "Checking specific migration..." -ForegroundColor Yellow
$migrationExists = php artisan migrate:status | Select-String "2025_08_25_134854_modify_assignee_id_to_text_in_device_requests_table"

if ($migrationExists) {
    Write-Host "Migration already exists in database" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Roll back this migration: php artisan migrate:rollback --step=1" -ForegroundColor White
    Write-Host "2. Reset and re-run: php artisan migrate:reset && php artisan migrate" -ForegroundColor White
    Write-Host "3. Fresh install (DANGER - loses data): php artisan migrate:fresh" -ForegroundColor Red
} else {
    Write-Host "Migration not run yet - safe to proceed with normal migration" -ForegroundColor Green
    php artisan migrate --force
}

# Step 3: Check for file conflicts
Write-Host "Checking for file system conflicts..." -ForegroundColor Yellow
$conflictFile = "database/migrations/2025_08_25_134854_modify_assignee_id_to_text_in_device_requests_table.php"

if (Test-Path $conflictFile) {
    Write-Host "Migration file exists locally" -ForegroundColor Green
    # Show file size and last modified
    $fileInfo = Get-ItemProperty $conflictFile
    Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor White
    Write-Host "Last modified: $($fileInfo.LastWriteTime)" -ForegroundColor White
} else {
    Write-Host "Migration file missing - this needs to be resolved!" -ForegroundColor Red
}

Write-Host "Conflict resolution analysis complete!" -ForegroundColor Green
