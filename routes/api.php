<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\PeripheralController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\SystemUnitController;
use App\Http\Controllers\SystemUnitStatsController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/users', [UserController::class, 'getUsers']);
Route::resource('usermanagement', UserController::class);

// Role management routes
Route::apiResource('roles', RoleController::class);

// Device management routes
Route::apiResource('devices', DeviceController::class);

// Monitor management routes
Route::apiResource('monitors', MonitorController::class);

// Location management routes
Route::get('locations/statistics', [LocationController::class, 'statistics']);
Route::apiResource('locations', LocationController::class);

// Station management routes
Route::get('stations/available-monitors', [StationController::class, 'getAvailableMonitors']);
Route::get('stations/available-system-units', [StationController::class, 'getAvailableSystemUnits']);
Route::get('stations/available-peripherals', [StationController::class, 'getAvailablePeripherals']);
Route::get('stations/locations', [StationController::class, 'getLocations']);
Route::get('stations/qr/{qrCode}', [StationController::class, 'showByQrCode']);
Route::post('stations/{station}/assign-asset', [StationController::class, 'assignAsset']);
Route::post('stations/{station}/unassign-asset', [StationController::class, 'unassignAsset']);
Route::post('stations/{station}/assign-peripherals', [StationController::class, 'assignPeripherals']);
Route::apiResource('stations', StationController::class);

// Peripheral management routes
Route::post('peripherals/{peripheral}/add-stock', [PeripheralController::class, 'addStock']);
Route::post('peripherals/{peripheral}/deploy-stock', [PeripheralController::class, 'deployStock']);
Route::post('peripherals/{peripheral}/return-stock', [PeripheralController::class, 'returnStock']);
Route::post('peripherals/{peripheral}/mark-damaged', [PeripheralController::class, 'markDamaged']);
Route::get('peripherals/{peripheral}/delivery-history', [PeripheralController::class, 'deliveryHistory']);
Route::apiResource('peripherals', PeripheralController::class);

// Parts management routes
Route::get('parts/types', [PartController::class, 'getPartTypes']);
Route::get('parts/{part}/items', [PartController::class, 'getItems']);
Route::get('parts/{part}/delivery-history', [PartController::class, 'deliveryHistory']);
Route::post('parts/{part}/add-stock', [PartController::class, 'addStock']);
Route::post('parts/{part}/remove-stock', [PartController::class, 'removeStock']);
Route::post('parts/{part}/items/{item}/assign', [PartController::class, 'assignItem']);
Route::post('parts/{part}/items/{item}/return', [PartController::class, 'returnItem']);
Route::apiResource('parts', PartController::class);

// System Unit management routes
Route::get('system-units/stats', [SystemUnitStatsController::class, 'index']);
Route::get('system-units/available-parts', [SystemUnitController::class, 'getAvailableParts']);
Route::get('system-units/with-qr', [SystemUnitController::class, 'indexWithQr']);
Route::get('system-units/qr/{qrCode}', [SystemUnitController::class, 'showByQrCode']);
Route::post('system-units/{systemUnit}/assign', [SystemUnitController::class, 'assign']);
Route::post('system-units/{systemUnit}/return', [SystemUnitController::class, 'returnUnit']);
Route::apiResource('system-units', SystemUnitController::class);

// Dashboard routes (temporary - no auth for testing)
Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/assets-received-per-month', [DashboardController::class, 'getAssetsReceivedPerMonth']);
Route::get('dashboard/asset-usage', [DashboardController::class, 'getAssetUsage']);
Route::get('dashboard/total-asset-value', [DashboardController::class, 'getTotalAssetValue']);
Route::get('dashboard/asset-value-per-month', [DashboardController::class, 'getAssetValuePerMonth']);
Route::get('dashboard/recent-transactions', [DashboardController::class, 'getRecentTransactions']);
