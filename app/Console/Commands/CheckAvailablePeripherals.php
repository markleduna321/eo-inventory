<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Peripheral;

class CheckAvailablePeripherals extends Command
{
    protected $signature = 'check:available-peripherals';
    protected $description = 'Check available peripherals for assignment';

    public function handle()
    {
        $this->info('=== Checking Available Peripherals ===');
        
        $this->info("\n--- All Peripherals ---");
        $allPeripherals = Peripheral::select('id', 'brand', 'model', 'type', 'available_stock', 'status', 'uses_serial_numbers')->get();
        
        foreach ($allPeripherals as $p) {
            $this->line("{$p->id}: {$p->brand} {$p->model} - Available: {$p->available_stock} - Status: {$p->status} - Uses Serial: " . ($p->uses_serial_numbers ? 'Yes' : 'No'));
        }
        
        $this->info("\n--- Available Non-Serial Peripherals (should appear in UI) ---");
        $availablePeripherals = Peripheral::where('status', 'active')
            ->where('available_stock', '>', 0)
            ->where('uses_serial_numbers', false)
            ->get();
            
        if ($availablePeripherals->count() > 0) {
            foreach ($availablePeripherals as $p) {
                $this->line("✓ {$p->id}: {$p->brand} {$p->model} - Available: {$p->available_stock}");
            }
        } else {
            $this->error("No peripherals match the criteria!");
        }
        
        $this->info("\n--- Filter Analysis ---");
        $this->line("Total peripherals: " . Peripheral::count());
        $this->line("Active peripherals: " . Peripheral::where('status', 'active')->count());
        $this->line("With available stock > 0: " . Peripheral::where('available_stock', '>', 0)->count());
        $this->line("Non-serial peripherals: " . Peripheral::where('uses_serial_numbers', false)->count());
        $this->line("Meeting ALL criteria: " . $availablePeripherals->count());
    }
}
