<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;
use Illuminate\Support\Facades\Http;

class TestPeripheralFlow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:peripheral-flow';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test complete peripheral assignment flow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $peripheral = Peripheral::find(1);
        $station3 = Station::find(3);
        
        $this->info('=== INITIAL STATE ===');
        $this->line("Peripheral Stock - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Test API call for available peripherals
        $this->info('=== AVAILABLE PERIPHERALS API ===');
        $response = Http::get('http://127.0.0.1:8000/api/stations/available-peripherals');
        $availablePeripherals = $response->json();
        $this->line("Available peripherals count: " . count($availablePeripherals));
        
        // Assign peripheral to station 3
        $this->info('=== ASSIGNING PERIPHERAL ===');
        try {
            $assignment = $station3->assignAsset('peripheral', 1);
            $this->info("Assigned peripheral to {$station3->name}");
        } catch (\Exception $e) {
            $this->error("Assignment failed: " . $e->getMessage());
        }
        
        // Check stock after assignment
        $peripheral->refresh();
        $this->line("After Assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Test API call again after assignment
        $this->info('=== AVAILABLE PERIPHERALS API AFTER ASSIGNMENT ===');
        $response = Http::get('http://127.0.0.1:8000/api/stations/available-peripherals');
        $availablePeripherals = $response->json();
        $this->line("Available peripherals count: " . count($availablePeripherals));
        
        // Test station data API
        $this->info('=== STATION DATA API ===');
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
