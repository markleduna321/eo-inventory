<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Peripheral;
use App\Models\Station;

class DebugPeripheralBinding extends Command
{
    protected $signature = 'debug:peripheral-binding {peripheral_id} {station_id}';
    protected $description = 'Debug peripheral binding issues';

    public function handle()
    {
        $peripheralId = $this->argument('peripheral_id');
        $stationId = $this->argument('station_id');

        $peripheral = Peripheral::find($peripheralId);
        $station = Station::find($stationId);

        if (!$peripheral) {
            $this->error("Peripheral with ID {$peripheralId} not found");
            return 1;
        }

        if (!$station) {
            $this->error("Station with ID {$stationId} not found");
            return 1;
        }

        $this->info("=== PERIPHERAL INFO ===");
        $this->line("ID: {$peripheral->id}");
        $this->line("Type: {$peripheral->type}");
        $this->line("Brand: {$peripheral->brand}");
        $this->line("Model: {$peripheral->model}");
        $this->line("Status: {$peripheral->status}");
        $this->line("Available Stock: {$peripheral->available_stock}");
        $this->line("Deployed Stock: {$peripheral->deployed_stock}");
        $this->line("Uses Serial Numbers: " . ($peripheral->uses_serial_numbers ? 'Yes' : 'No'));

        $this->info("=== STATION INFO ===");
        $this->line("ID: {$station->id}");
        $this->line("Name: {$station->name}");

        $this->info("=== ASSIGNMENT TEST ===");
        try {
            $this->line("Attempting to assign peripheral {$peripheralId} to station {$stationId}...");
            $assignment = $station->assignAsset('peripheral', $peripheralId);
            $this->info("✅ Assignment successful!");
            
            // Refresh peripheral to see updated stock
            $peripheral->refresh();
            $this->line("After assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}");
            
        } catch (\Exception $e) {
            $this->error("❌ Assignment failed: " . $e->getMessage());
        }

        return 0;
    }
}
