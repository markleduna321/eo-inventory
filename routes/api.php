<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\MonitorController;
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
