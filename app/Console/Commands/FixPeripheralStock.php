<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;

class FixPeripheralStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:peripheral-stock';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix peripheral stock by unassigning and reassigning';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== CURRENT STATE ===');
        $peripheral = Peripheral::find(1);
        $station3 = Station::find(3);
        
        $this->line("Peripheral Stock - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        $this->line("Station 3: {$station3->name}");
        
        // First unassign from station 3 to fix the stock
        $this->info('=== UNASSIGNING FROM STATION 3 ===');
        try {
            $station3->unassignAsset('peripheral', 1);
            $this->info("Unassigned peripheral from {$station3->name}");
        } catch (\Exception $e) {
            $this->error("Unassignment failed: " . $e->getMessage());
        }
        
        // Check stock after unassignment
        $peripheral->refresh();
        $this->line("After Unassignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Now reassign to station 3 to test the stock deployment
        $this->info('=== REASSIGNING TO STATION 3 ===');
        try {
            $assignment = $station3->assignAsset('peripheral', 1);
            $this->info("Reassigned peripheral to {$station3->name}");
        } catch (\Exception $e) {
            $this->error("Reassignment failed: " . $e->getMessage());
        }
        
        // Check final stock
        $peripheral->refresh();
        $this->line("After Reassignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        return 0;
    }
}
