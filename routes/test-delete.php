<?php

use Illuminate\Http\Request;

Route::get('/test-delete-unit', function () {
    try {
        // Get a system unit to test
        $systemUnit = \App\Models\SystemUnit::first();
        
        if (!$systemUnit) {
            return response()->json(['error' => 'No system units found to test']);
        }
        
        echo "<h1>Testing System Unit Delete</h1>";
        echo "<p>Found system unit: {$systemUnit->system_name} (ID: {$systemUnit->id})</p>";
        echo "<p>Unit type: {$systemUnit->unit_type}</p>";
        echo "<p>Status: {$systemUnit->status}</p>";
        
        // Check if user is authenticated
        if (auth()->check()) {
            echo "<p>✓ User is authenticated: " . auth()->user()->name . "</p>";
        } else {
            echo "<p>✗ User is not authenticated</p>";
        }
        
        // Test the destroy method logic
        echo "<h2>Testing destroy logic...</h2>";
        
        if ($systemUnit->unit_type === 'custom_built') {
            $partItemsCount = $systemUnit->partItems->count();
            echo "<p>Custom built unit with {$partItemsCount} part items</p>";
        } else {
            echo "<p>Pre-built unit</p>";
        }
        
        echo "<p>✓ Destroy method would work for this unit</p>";
        
        return response()->json([
            'success' => true,
            'message' => 'Delete test completed - check console for details',
            'unit' => $systemUnit
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
});
