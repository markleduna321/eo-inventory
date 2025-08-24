<?php

/**
 * Production Authentication Diagnostic Script
 * 
 * Run this script on your production server to diagnose authentication issues
 * Usage: php prod-auth-diagnostic.php
 */

require_once 'vendor/autoload.php';

echo "=== PRODUCTION AUTHENTICATION DIAGNOSTIC ===\n\n";

// Check if we're in the right directory
if (!file_exists('artisan')) {
    echo "❌ Error: Please run this script from the Laravel project root directory\n";
    exit(1);
}

// Load environment
if (file_exists('.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
} else {
    echo "❌ Error: .env file not found\n";
    exit(1);
}

echo "1. ENVIRONMENT CONFIGURATION\n";
echo "   APP_ENV: " . (env('APP_ENV') ?: 'not set') . "\n";
echo "   APP_URL: " . (env('APP_URL') ?: 'not set') . "\n";
echo "   APP_DEBUG: " . (env('APP_DEBUG') ? 'true' : 'false') . "\n";

echo "\n2. SESSION CONFIGURATION\n";
echo "   SESSION_DRIVER: " . (env('SESSION_DRIVER') ?: 'not set') . "\n";
echo "   SESSION_LIFETIME: " . (env('SESSION_LIFETIME') ?: 'not set') . "\n";
echo "   SESSION_SECURE_COOKIE: " . (env('SESSION_SECURE_COOKIE') ? 'true' : 'false') . "\n";
echo "   SESSION_DOMAIN: " . (env('SESSION_DOMAIN') ?: 'not set') . "\n";

echo "\n3. SANCTUM CONFIGURATION\n";
echo "   SANCTUM_STATEFUL_DOMAINS: " . (env('SANCTUM_STATEFUL_DOMAINS') ?: 'not set') . "\n";

echo "\n4. DIRECTORY PERMISSIONS\n";
echo "   storage/ writable: " . (is_writable('storage') ? '✅ Yes' : '❌ No') . "\n";
echo "   storage/framework/sessions/ exists: " . (is_dir('storage/framework/sessions') ? '✅ Yes' : '❌ No') . "\n";
echo "   storage/framework/sessions/ writable: " . (is_writable('storage/framework/sessions') ? '✅ Yes' : '❌ No') . "\n";

echo "\n5. CACHE STATUS\n";
echo "   Config cached: " . (file_exists('bootstrap/cache/config.php') ? '✅ Yes' : '❌ No') . "\n";
echo "   Routes cached: " . (file_exists('bootstrap/cache/routes-v7.php') ? '✅ Yes' : '❌ No') . "\n";

echo "\n6. RECOMMENDATIONS\n";

// Check if SANCTUM_STATEFUL_DOMAINS is set
if (!env('SANCTUM_STATEFUL_DOMAINS')) {
    echo "   ❌ CRITICAL: SANCTUM_STATEFUL_DOMAINS not set\n";
    echo "      Add to .env: SANCTUM_STATEFUL_DOMAINS=eo-assetmanagement.com,www.eo-assetmanagement.com\n";
}

// Check if SESSION_SECURE_COOKIE is set for HTTPS
if (strpos(env('APP_URL', ''), 'https://') === 0 && !env('SESSION_SECURE_COOKIE')) {
    echo "   ⚠️  WARNING: Using HTTPS but SESSION_SECURE_COOKIE not set to true\n";
    echo "      Add to .env: SESSION_SECURE_COOKIE=true\n";
}

// Check if SESSION_DOMAIN is set
if (!env('SESSION_DOMAIN')) {
    echo "   ⚠️  WARNING: SESSION_DOMAIN not set\n";
    echo "      Add to .env: SESSION_DOMAIN=.eo-assetmanagement.com\n";
}

echo "\n7. NEXT STEPS\n";
echo "   1. Update your .env file with the missing configurations\n";
echo "   2. Run: php artisan config:cache\n";
echo "   3. Run: php artisan route:cache\n";
echo "   4. Run: php artisan view:cache\n";
echo "   5. Clear browser cookies and login again\n";

echo "\n=== DIAGNOSTIC COMPLETE ===\n";
