<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\StationHistory;
use Illuminate\Http\Request;

class StationHistoryController extends Controller
{
    /**
     * Get station history
     */
    public function index(Request $request, Station $station)
    {
        $history = $station->history()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                // Format history item for display
                $actionLabel = '';
                switch ($item->action_type) {
                    case StationHistory::ACTION_CREATE:
                        $actionLabel = 'Created';
                        break;
                    case StationHistory::ACTION_UPDATE:
                        $actionLabel = 'Updated';
                        break;
                    case StationHistory::ACTION_BIND:
                        $actionLabel = 'Asset Bound';
                        break;
                    case StationHistory::ACTION_UNBIND:
                        $actionLabel = 'Asset Unbound';
                        break;
                }
                
                // Format asset info if present
                $assetInfo = null;
                if ($item->asset_type && $item->asset_id) {
                    $assetInfo = [
                        'type' => ucfirst($item->asset_type),
                        'name' => $item->asset_name,
                        'serial' => $item->asset_serial,
                    ];
                }
                
                return [
                    'id' => $item->id,
                    'timestamp' => $item->created_at,
                    'formatted_date' => $item->created_at->format('M j, Y g:i A'),
                    'action' => $item->action_type,
                    'action_label' => $actionLabel,
                    'asset' => $assetInfo,
                    'reason' => $item->unbind_reason,
                    'notes' => $item->notes,
                    'user' => $item->user ? [
                        'id' => $item->user->id,
                        'name' => $item->user->name
                    ] : null
                ];
            });

        return response()->json($history);
    }
}
