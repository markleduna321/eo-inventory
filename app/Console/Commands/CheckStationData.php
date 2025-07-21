<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;

class CheckStationData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:station-data {station_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check station data with assets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $stationId = $this->argument('station_id');
        $station = Station::with(['stationAssets'])->find($stationId);
        
        if (!$station) {
            $this->error("Station with ID {$stationId} not found");
            return 1;
        }
        
        $this->info("Station: {$station->name}");
        $this->info("Assets count: " . $station->stationAssets->count());
        
        foreach($station->stationAssets as $asset) {
            $this->line("Asset Type: {$asset->asset_type} | Asset ID: {$asset->asset_id} | Assigned: {$asset->assigned_at} | Unassigned: " . ($asset->unassigned_at ?? 'NULL'));
        }
        
        $this->info('JSON representation:');
        $this->line(json_encode($station->toArray(), JSON_PRETTY_PRINT));
        
        return 0;
    }
}
