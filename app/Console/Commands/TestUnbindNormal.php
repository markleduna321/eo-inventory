<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Peripheral;
use App\Models\Station;

class TestUnbindNormal extends Command
{
    protected $signature = 'test:unbind-normal {peripheral_id} {station_id}';
    protected $description = 'Test normal unbinding of a peripheral';

    public function handle()
    {
        $peripheralId = $this->argument('peripheral_id');
        $stationId = $this->argument('station_id');

        $peripheral = Peripheral::find($peripheralId);
        $station = Station::find($stationId);

        if (!$peripheral || !$station) {
            $this->error("Peripheral or station not found");
            return 1;
        }

        $this->info("=== BEFORE UNBIND ===");
        $this->line("Available: {$peripheral->available_stock}");
        $this->line("Deployed: {$peripheral->deployed_stock}");
        $this->line("Damaged: {$peripheral->damaged_stock}");
        $this->line("Status: {$peripheral->status}");

        try {
            $this->line("Unbinding peripheral {$peripheralId} from station {$stationId} normally...");
            $result = $station->unassignAsset(
                'peripheral', 
                $peripheralId, 
                null, // no serial number
                null, // no reason - normal unbind
                'Test normal unbinding'
            );
            
            $this->info("✅ Unbind successful!");
            
            // Refresh to see changes
            $peripheral->refresh();
            $this->info("=== AFTER UNBIND ===");
            $this->line("Available: {$peripheral->available_stock}");
            $this->line("Deployed: {$peripheral->deployed_stock}");
            $this->line("Damaged: {$peripheral->damaged_stock}");
            $this->line("Status: {$peripheral->status}");
            
        } catch (\Exception $e) {
            $this->error("❌ Unbind failed: " . $e->getMessage());
        }

        return 0;
    }
}
