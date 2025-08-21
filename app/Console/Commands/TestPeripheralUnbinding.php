<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;
use App\Models\Peripheral;
use App\Models\PeripheralSerial;
use App\Models\StationHistory;

class TestPeripheralUnbinding extends Command
{
    protected $signature = 'test:peripheral-unbinding';
    protected $description = 'Test peripheral unbinding for both serial and non-serial peripherals';

    public function handle()
    {
        $this->info('=== Testing Peripheral Unbinding ===');
        
        // Test 1: Non-serial peripheral (peripheral ID 12 - Mouse)
        $this->info("\n--- Test 1: Non-serial Peripheral (Mouse) ---");
        $this->testNonSerialPeripheral();
        
        // Test 2: Serial peripheral
        $this->info("\n--- Test 2: Serial Peripheral ---");
        $this->testSerialPeripheral();
        
        $this->info("\n=== All Tests Completed ===");
    }
    
    private function testNonSerialPeripheral()
    {
        $peripheral = Peripheral::find(15); // AWP AID1000-1000VA (no serial)
        $station = Station::find(19);
        
        if (!$peripheral || !$station) {
            $this->error('Peripheral (ID 15) or Station (ID 19) not found');
            return;
        }
        
        $this->info("Testing peripheral: {$peripheral->brand} {$peripheral->model}");
        $this->info("Before assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
        
        // Assign the peripheral
        try {
            $assignment = $station->assignAsset('peripheral', $peripheral->id);
            $peripheral->refresh();
            $this->info("After assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            
            // Test normal unbind (working condition)
            $station->unassignAsset('peripheral', $peripheral->id, null, 'Working');
            $peripheral->refresh();
            $this->info("After normal unbind - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            
            // Assign again
            $assignment = $station->assignAsset('peripheral', $peripheral->id);
            $peripheral->refresh();
            $this->info("After re-assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            
            // Test damaged unbind
            $station->unassignAsset('peripheral', $peripheral->id, null, StationHistory::REASON_DAMAGED);
            $peripheral->refresh();
            $this->info("After damaged unbind - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
    }
    
    private function testSerialPeripheral()
    {
        // Find a peripheral that uses serial numbers
        $peripheral = Peripheral::find(14); // AWP AID650-650VA (with serial)
        $station = Station::find(19);
        
        if (!$peripheral || !$station) {
            $this->error('Peripheral with serial numbers (ID 14) or Station (ID 19) not found');
            return;
        }
        
        // Find an available serial number
        $serialRecord = PeripheralSerial::where('peripheral_id', $peripheral->id)
            ->where('status', 'available')
            ->first();
            
        if (!$serialRecord) {
            $this->error('No available serial numbers for this peripheral');
            return;
        }
        
        $this->info("Testing peripheral: {$peripheral->brand} {$peripheral->model} (Serial: {$serialRecord->serial_number})");
        $this->info("Before assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
        $this->info("Serial status before: {$serialRecord->status}");
        
        try {
            // Assign the peripheral with serial
            $assignment = $station->assignAsset('peripheral', $peripheral->id, $serialRecord->serial_number);
            $peripheral->refresh();
            $serialRecord->refresh();
            $this->info("After assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            $this->info("Serial status after assignment: {$serialRecord->status}");
            
            // Test normal unbind (working condition)
            $station->unassignAsset('peripheral', $peripheral->id, $serialRecord->serial_number, 'Working');
            $peripheral->refresh();
            $serialRecord->refresh();
            $this->info("After normal unbind - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            $this->info("Serial status after normal unbind: {$serialRecord->status}");
            
            // Assign again
            $assignment = $station->assignAsset('peripheral', $peripheral->id, $serialRecord->serial_number);
            $peripheral->refresh();
            $serialRecord->refresh();
            $this->info("After re-assignment - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            $this->info("Serial status after re-assignment: {$serialRecord->status}");
            
            // Test damaged unbind
            $station->unassignAsset('peripheral', $peripheral->id, $serialRecord->serial_number, StationHistory::REASON_DAMAGED);
            $peripheral->refresh();
            $serialRecord->refresh();
            $this->info("After damaged unbind - Available: {$peripheral->available_stock}, Deployed: {$peripheral->deployed_stock}, Damaged: {$peripheral->damaged_stock}");
            $this->info("Serial status after damaged unbind: {$serialRecord->status}");
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
    }
}
