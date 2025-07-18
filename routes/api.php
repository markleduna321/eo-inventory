<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\StationController;
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
Route::get('stations/locations', [StationController::class, 'getLocations']);
Route::post('stations/{station}/assign-asset', [StationController::class, 'assignAsset']);
Route::post('stations/{station}/unassign-asset', [StationController::class, 'unassignAsset']);
Route::apiResource('stations', StationController::class);
