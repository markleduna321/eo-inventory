<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\SystemUnitController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\DeviceController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware('redirectBasedOnRole')->get('/', function () {
    return Inertia::render('login/page');
})->name('login');

Route::middleware('auth:sanctum', 'role:1,2')->prefix('admin')->group(function () {
    
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard/page');
    });

    Route::prefix('user_management')->group(function () {
        Route::get('/', function () {
        return Inertia::render('admin/user_management/page');
        });

        /* Route::get('/{id}', function ($id) {
            $user = Profiling::find($id);
    
            if (!$user) {
                return redirect()->route('user.index')->withErrors('Product not found');
            }
    
            return Inertia::render('admin/user_management/id/page', [
                'user' => $user
            ]);
        }); */
    });

    Route::prefix('products')->group(function () {
        Route::get('/', function () {
        return Inertia::render('admin/products/page');
        });

        
    });

    Route::get('devices', function () {
        return Inertia::render('admin/devices/page'); 
    });

    Route::prefix('system_units')->group(function () {
        Route::get('/', function () {
        return Inertia::render('admin/system_units/page');
        });

        Route::get('1', function () {
        return Inertia::render('admin/system_units/id/page');
        });

        /* Route::get('/{id}', function ($id) {
            $systemUnit = SystemUnit::find($id);
    
            if (!$systemUnit) {
                return redirect()->route('system_units.index')->withErrors('System Unit not found');
            }
    
            return Inertia::render('admin/system_units/id/page', [
                'systemUnit' => $systemUnit
            ]);
        }); */
    });

    Route::get('monitors', function () {
        return Inertia::render('admin/monitor/page'); 
    });

    Route::get('peripherals', function () {
        return Inertia::render('admin/peripherals/page'); 
    });

    Route::get('parts_and_accessories', function () {
        return Inertia::render('admin/parts/page'); 
    });

    Route::get('locations', function () {
        return Inertia::render('admin/locations/page'); 
    });

    Route::get('stations', function () {
        return Inertia::render('admin/stations/page'); 
    });

    Route::get('request_item', function () {
        return Inertia::render('admin/request_item/page'); 
    });

    Route::get('purchase_request', function () {
        return Inertia::render('admin/purchase_request/page'); 
    });

    
    Route::prefix('reports')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/reports/page');
        });
        
        // This catch-all route for specific report types
        Route::get('/{reportType}', function ($reportType) {
            return Inertia::render('admin/reports/detail', [
                'reportType' => $reportType
            ]);
        })->where('reportType', '^(?!.*ai-enhanced).*$'); // Exclude ai-enhanced pattern
    });
});

// QR Code routes (public access for scanning)
Route::get('/system-units/qr/{qrCode}', [SystemUnitController::class, 'showByQrCode'])
    ->name('system-units.qr-view');

Route::get('/system-units/{systemUnit}/qr-image', [SystemUnitController::class, 'generateQrCode'])
    ->name('system-units.qr-image');

Route::get('/stations/qr/{qrCode}', [StationController::class, 'showByQrCode'])
    ->name('stations.qr-view');

Route::get('/stations/{station}/qr-image', [StationController::class, 'generateQrCode'])
    ->name('stations.qr-image');

// Station QR Code routes (public access for scanning)
Route::get('/stations/qr/{qrCode}', [StationController::class, 'showByQrCode'])
    ->name('stations.qr-view');

Route::get('/stations/{station}/qr-image', [StationController::class, 'generateQrCode'])
    ->name('stations.qr-image');

// Monitor QR Code routes (public access for scanning)
Route::get('/monitors/qr/{qrCode}', [MonitorController::class, 'showByQrCode'])
    ->name('monitors.qr-view');

Route::get('/monitors/{monitor}/qr-image', [MonitorController::class, 'generateQrCode'])
    ->name('monitors.qr-image');

// Device QR Code routes (public access for scanning)
Route::get('/devices/qr/{qrCode}', [DeviceController::class, 'showByQrCode'])
    ->name('devices.qr-view');

Route::get('/devices/{device}/qr-image', [DeviceController::class, 'generateQrCode'])
    ->name('devices.qr-image');

Route::middleware('auth:sanctum', 'role:3')->prefix('user')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('user/dashboard/page');
    });
});


/* Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
}); */

/* Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Web-based user endpoint for frontend forms
    Route::get('/current-user', function (Request $request) {
        return response()->json($request->user());
    })->name('current.user');
}); */

require __DIR__.'/auth.php';
