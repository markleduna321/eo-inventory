<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StationAsset;
use App\Models\Peripheral;

class CheckStationAssets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:station-assets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check station asset assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== STATION ASSETS ===');
        $assets = StationAsset::with(['station'])->get();
        foreach($assets as $asset) {
            $stationName = $asset->station ? $asset->station->name : 'NULL/DELETED';
            $this->line("Station: {$stationName} | Asset Type: {$asset->asset_type} | Asset ID: {$asset->asset_id} | Assigned: {$asset->assigned_at} | Unassigned: " . ($asset->unassigned_at ?? 'NULL'));
        }
        
        $this->info('=== PERIPHERAL STOCKS ===');
        $peripherals = Peripheral::all();
        foreach($peripherals as $p) {
            $this->line("ID: {$p->id} | Type: {$p->type} | Brand: {$p->brand} | Available: {$p->available_stock} | Deployed: {$p->deployed_stock}");
        }
        
        return 0;
    }
}
