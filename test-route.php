<?php

use Illuminate\Http\Request;

// Test API endpoint for checking peripheral serial management
Route::get('test-peripheral-serials', function (Request $request) {
    $peripheralId = $request->get('peripheral_id', 1); // Default to peripheral ID 1
    
    $peripheral = App\Models\Peripheral::with('serialNumbers')->find($peripheralId);
    
    if (!$peripheral) {
        return response()->json(['error' => 'Peripheral not found']);
    }
    
    $serialCounts = [
        'available' => $peripheral->serialNumbers()->where('status', 'available')->count(),
        'deployed' => $peripheral->serialNumbers()->where('status', 'deployed')->count(),
        'damaged' => $peripheral->serialNumbers()->where('status', 'damaged')->count(),
    ];
    
    return response()->json([
        'peripheral_id' => $peripheral->id,
        'brand_model' => $peripheral->brand . ' ' . $peripheral->model,
        'database_stocks' => [
            'available_stock' => $peripheral->available_stock,
            'deployed_stock' => $peripheral->deployed_stock,
            'damaged_stock' => $peripheral->damaged_stock,
        ],
        'calculated_from_serials' => $serialCounts,
        'serial_numbers_count' => $peripheral->serialNumbers->count(),
        'serial_numbers' => $peripheral->serialNumbers->map(function($serial) {
            return [
                'id' => $serial->id,
                'serial_number' => $serial->serial_number,
                'status' => $serial->status,
                'unit_price' => $serial->unit_price
            ];
        })
    ]);
});
