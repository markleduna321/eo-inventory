<?php

namespace App\Http\Controllers;

use App\Models\SystemUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemUnitStatsController extends Controller
{
    /**
     * Get system unit statistics
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total' => SystemUnit::count(),
            'available' => SystemUnit::where('status', 'available')->count(),
            'assigned' => SystemUnit::where('status', 'assigned')->count(),
            'customBuilt' => SystemUnit::where('unit_type', 'custom_built')->count(),
        ];

        return response()->json($stats);
    }
}
