<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;

class TestPeripheralAssignment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:peripheral-assignment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test peripheral assignment and stock management';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== BEFORE TEST ===');
        $peripheral = Peripheral::find(1);
        $this->line("Peripheral Stock - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Get a station to test with
        $station = Station::find(4); // Developer Workstation A2
        $this->line("Testing with station: {$station->name}");
        
        // Test assigning peripheral
        $this->info('=== ASSIGNING PERIPHERAL ===');
        try {
            $assignment = $station->assignAsset('peripheral', 1);
            $this->info("Assignment created successfully: ID {$assignment->id}");
        } catch (\Exception $e) {
            $this->error("Assignment failed: " . $e->getMessage());
            return 1;
        }
        
        // Check stock after assignment
        $peripheral->refresh();
        $this->line("After Assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        // Test unassigning peripheral
        $this->info('=== UNASSIGNING PERIPHERAL ===');
        try {
            $station->unassignAsset('peripheral', 1);
            $this->info("Unassignment completed successfully");
        } catch (\Exception $e) {
            $this->error("Unassignment failed: " . $e->getMessage());
            return 1;
        }
        
        // Check stock after unassignment
        $peripheral->refresh();
        $this->line("After Unassignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        return 0;
    }
}
