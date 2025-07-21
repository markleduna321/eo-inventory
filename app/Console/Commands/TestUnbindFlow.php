<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;
use Illuminate\Support\Facades\Http;

class TestUnbindFlow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:unbind-flow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the unbinding flow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $peripheral = Peripheral::find(1);
        $station3 = Station::find(3);
        
        $this->info('=== BEFORE UNBIND ===');
        $this->line("Peripheral Stock - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Test API call for available peripherals
        $response = Http::get('http://127.0.0.1:8000/api/stations/available-peripherals');
        $availablePeripherals = $response->json();
        $this->line("Available peripherals count: " . count($availablePeripherals));
        
        // Unbind peripheral from station 3
        $this->info('=== UNBINDING PERIPHERAL ===');
        try {
            $station3->unassignAsset('peripheral', 1);
            $this->info("Unassigned peripheral from {$station3->name}");
        } catch (\Exception $e) {
            $this->error("Unassignment failed: " . $e->getMessage());
        }
        
        // Check stock after unassignment
        $peripheral->refresh();
        $this->line("After Unassignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Test API call again after unassignment
        $this->info('=== AVAILABLE PERIPHERALS API AFTER UNBIND ===');
        $response = Http::get('http://127.0.0.1:8000/api/stations/available-peripherals');
        $availablePeripherals = $response->json();
        $this->line("Available peripherals count: " . count($availablePeripherals));
        
        // Test station data API
        $this->info('=== STATION DATA API AFTER UNBIND ===');
        $response = Http::get("http://127.0.0.1:8000/api/stations/3");
        $stationData = $response->json();
        $activePeripheralAssets = collect($stationData['station_assets'])
            ->filter(function($asset) {
                return $asset['asset_type'] === 'peripheral' && $asset['unassigned_at'] === null;
            });
        $this->line("Active peripheral assignments: " . $activePeripheralAssets->count());
        
        return 0;
    }
}
