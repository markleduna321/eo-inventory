# Production Authentication Fix

## Issue
Getting 401 Unauthorized errors in production after recent updates.

## Root Cause
Laravel Sanctum is not configured properly for the production domain `eo-assetmanagement.com`.

## Required Fixes

### 1. Update Production .env File

Add these variables to your production `.env` file:

```bash
# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=eo-assetmanagement.com,www.eo-assetmanagement.com

# Session Configuration for Production
SESSION_DRIVER=file
SESSION_LIFETIME=480
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=.eo-assetmanagement.com

# App Configuration
APP_URL=https://eo-assetmanagement.com
```

### 2. Update CORS Configuration

Edit `config/cors.php` to support credentials:

```php
'supports_credentials' => true,
```

### 3. Clear Caches

After making these changes, run these commands on your production server:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Alternative Quick Fix

If you need an immediate fix, you can temporarily remove authentication from the stations route by moving it outside the auth middleware group in `routes/api.php`:

```php
// Move this line outside the auth:sanctum middleware group
Route::apiResource('stations', StationController::class);
```

However, this is NOT recommended for security reasons.

## Testing

After applying the fixes:
1. Clear browser cookies/cache
2. Login again
3. Test the stations API endpoint

## Notes

- The session lifetime is set to 480 minutes (8 hours) for better user experience
- Session cookies are set to secure (HTTPS only) for production
- The domain is set to include subdomains (www)
