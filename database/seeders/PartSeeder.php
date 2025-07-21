<?php

namespace Database\Seeders;

use App\Models\Part;
use App\Models\PartDelivery;
use App\Models\PartItem;
use Illuminate\Database\Seeder;

class PartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create RAM parts
        $ram16gb = Part::create([
            'type' => 'ram',
            'brand' => 'Corsair',
            'model' => 'Vengeance LPX 16GB DDR4',
            'description' => 'High-performance DDR4 memory for gaming and productivity',
            'specifications' => [
                'capacity' => '16GB',
                'type' => 'DDR4',
                'speed' => '3200MHz',
                'form_factor' => 'DIMM',
                'voltage' => '1.35V'
            ],
            'location' => 'storage',
            'total_stock' => 10,
            'available_stock' => 8,
            'unit_price' => 89.99,
            'notes' => 'Good for gaming builds',
            'received_by' => 'Admin User',
        ]);

        // Create initial delivery for RAM
        $ramDelivery = $ram16gb->deliveries()->create([
            'quantity_delivered' => 10,
            'unit_price' => 89.99,
            'supplier' => 'Newegg',
            'purchase_order' => 'PO-2025-001',
            'invoice_number' => 'INV-12345',
            'delivery_date' => '2025-07-20',
            'notes' => 'Initial stock delivery',
            'received_by' => 'Admin User',
            'delivery_status' => 'received',
        ]);

        // Create individual RAM items
        for ($i = 1; $i <= 10; $i++) {
            $status = $i <= 8 ? 'available' : 'assigned';
            $assigned_to = $i > 8 ? 'Workstation-' . ($i - 8) : null;
            
            $ram16gb->items()->create([
                'part_delivery_id' => $ramDelivery->id,
                'serial_number' => 'RAM-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'barcode' => 'BC-RAM-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'status' => $status,
                'assigned_to' => $assigned_to,
                'assigned_date' => $status === 'assigned' ? '2025-07-21' : null,
                'location' => $status === 'available' ? 'storage' : 'office_a',
            ]);
        }

        // Create SSD parts
        $ssd1tb = Part::create([
            'type' => 'ssd',
            'brand' => 'Samsung',
            'model' => '980 PRO 1TB NVMe',
            'description' => 'High-speed NVMe SSD for professional workloads',
            'specifications' => [
                'capacity' => '1TB',
                'interface' => 'NVMe M.2',
                'form_factor' => '2280',
                'read_speed' => '7000 MB/s',
                'write_speed' => '5000 MB/s'
            ],
            'location' => 'storage',
            'total_stock' => 5,
            'available_stock' => 5,
            'unit_price' => 129.99,
            'notes' => 'Premium NVMe drives',
            'received_by' => 'Admin User',
        ]);

        // Create delivery for SSD
        $ssdDelivery = $ssd1tb->deliveries()->create([
            'quantity_delivered' => 5,
            'unit_price' => 129.99,
            'supplier' => 'Amazon Business',
            'purchase_order' => 'PO-2025-002',
            'invoice_number' => 'INV-67890',
            'delivery_date' => '2025-07-21',
            'notes' => 'Fast delivery, all items intact',
            'received_by' => 'Admin User',
            'delivery_status' => 'received',
        ]);

        // Create individual SSD items
        for ($i = 1; $i <= 5; $i++) {
            $ssd1tb->items()->create([
                'part_delivery_id' => $ssdDelivery->id,
                'serial_number' => 'SSD-SAM-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'barcode' => 'BC-SSD-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'status' => 'available',
                'location' => 'storage',
            ]);
        }

        // Create GPU parts
        $gpu = Part::create([
            'type' => 'gpu',
            'brand' => 'NVIDIA',
            'model' => 'GeForce RTX 4070',
            'description' => 'High-performance graphics card for gaming and creative work',
            'specifications' => [
                'memory' => '12GB GDDR6X',
                'base_clock' => '1920 MHz',
                'boost_clock' => '2475 MHz',
                'memory_bandwidth' => '504 GB/s',
                'interface' => 'PCIe 4.0 x16'
            ],
            'location' => 'secure_storage',
            'total_stock' => 3,
            'available_stock' => 2,
            'unit_price' => 649.99,
            'notes' => 'High-value items, keep secure',
            'received_by' => 'Admin User',
        ]);

        // Create delivery for GPU
        $gpuDelivery = $gpu->deliveries()->create([
            'quantity_delivered' => 3,
            'unit_price' => 649.99,
            'supplier' => 'Best Buy Business',
            'purchase_order' => 'PO-2025-003',
            'invoice_number' => 'INV-BB001',
            'delivery_date' => '2025-07-19',
            'notes' => 'Requires signature for delivery',
            'received_by' => 'Admin User',
            'delivery_status' => 'received',
        ]);

        // Create individual GPU items
        for ($i = 1; $i <= 3; $i++) {
            $status = $i <= 2 ? 'available' : 'assigned';
            $assigned_to = $i > 2 ? 'Graphics Workstation 1' : null;
            
            $gpu->items()->create([
                'part_delivery_id' => $gpuDelivery->id,
                'serial_number' => 'GPU-RTX-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'barcode' => 'BC-GPU-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'status' => $status,
                'assigned_to' => $assigned_to,
                'assigned_date' => $status === 'assigned' ? '2025-07-20' : null,
                'location' => $status === 'available' ? 'secure_storage' : 'design_dept',
            ]);
        }
    }
}
