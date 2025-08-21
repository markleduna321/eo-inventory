<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;

class TestNonSerialBinding extends Command
{
    protected $signature = 'test:non-serial-binding';
    protected $description = 'Test binding peripherals without serial numbers';

    public function handle()
    {
        $this->info('=== Testing Non-Serial Peripheral Binding ===');
        
        // Get a station
        $station = Station::first();
        if (!$station) {
            $this->error('No stations found');
            return;
        }
        
        // Get non-serial peripherals
        $peripherals = Peripheral::where('status', 'active')
            ->where('available_stock', '>', 0)
            ->where('uses_serial_numbers', false)
            ->get();
            
        if ($peripherals->count() === 0) {
            $this->error('No non-serial peripherals available');
            return;
        }
        
        $peripheral = $peripherals->first();
        
        $this->info("Testing with:");
        $this->line("Station: {$station->name} (ID: {$station->id})");
        $this->line("Peripheral: {$peripheral->brand} {$peripheral->model} (ID: {$peripheral->id})");
        $this->line("Before - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
        
        try {
            // Test the assignment
            $assignment = $station->assignAsset('peripheral', $peripheral->id);
            
            $peripheral->refresh();
            $this->info("✓ Assignment successful!");
            $this->line("After - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
            $this->line("Assignment ID: {$assignment->id}");
            
        } catch (\Exception $e) {
            $this->error("✗ Assignment failed: " . $e->getMessage());
            $this->line("Exception details:");
            $this->line("File: " . $e->getFile());
            $this->line("Line: " . $e->getLine());
            $this->line("Trace:");
            foreach (explode("\n", $e->getTraceAsString()) as $line) {
                $this->line("  " . $line);
            }
        }
    }
}
