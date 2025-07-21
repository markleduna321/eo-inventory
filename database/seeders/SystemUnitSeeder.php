<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemUnit;

class SystemUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample pre-built system units
        SystemUnit::create([
            'serial_number' => 'SYS-DELL001',
            'system_name' => 'Dell OptiPlex Workstation 01',
            'unit_type' => 'pre_built',
            'brand' => 'Dell',
            'model' => 'OptiPlex 7070',
            'description' => 'Standard office workstation',
            'operating_system' => 'Windows 11 Pro',
            'status' => 'available',
            'location' => 'storage',
            'received_by' => 'IT Admin',
            'purchase_price' => 1299.99,
            'supplier' => 'Dell Direct',
            'purchase_date' => '2024-01-15',
            'warranty_expiry' => '2027-01-15',
            'specifications' => [
                'cpu' => 'Intel Core i7-9700',
                'ram' => '16GB DDR4',
                'storage' => '512GB NVMe SSD',
                'gpu' => 'Intel UHD Graphics 630',
                'motherboard' => 'Dell Proprietary',
                'psu' => '260W',
                'case' => 'Dell OptiPlex SFF'
            ],
            'notes' => 'Ready for deployment'
        ]);

        SystemUnit::create([
            'serial_number' => 'SYS-HP002',
            'system_name' => 'HP EliteDesk Workstation 02',
            'unit_type' => 'pre_built',
            'brand' => 'HP',
            'model' => 'EliteDesk 800 G6',
            'description' => 'High-performance workstation for design work',
            'operating_system' => 'Windows 11 Pro',
            'status' => 'assigned',
            'location' => 'office_a',
            'assigned_to' => 'John Doe - Design Team',
            'received_by' => 'IT Admin',
            'purchase_price' => 1899.99,
            'supplier' => 'HP Enterprise',
            'purchase_date' => '2024-02-20',
            'warranty_expiry' => '2027-02-20',
            'specifications' => [
                'cpu' => 'Intel Core i9-10900',
                'ram' => '32GB DDR4',
                'storage' => '1TB NVMe SSD',
                'gpu' => 'NVIDIA Quadro P2200',
                'motherboard' => 'HP Proprietary',
                'psu' => '400W',
                'case' => 'HP EliteDesk MT'
            ],
            'notes' => 'Configured for CAD software'
        ]);

        SystemUnit::create([
            'serial_number' => 'SYS-CUSTOM001',
            'system_name' => 'Custom Gaming Rig 01',
            'unit_type' => 'custom_built',
            'description' => 'High-end gaming system built from parts inventory',
            'operating_system' => 'Windows 11 Home',
            'status' => 'maintenance',
            'location' => 'it_department',
            'received_by' => 'IT Admin',
            'purchase_price' => 2500.00,
            'supplier' => 'Various',
            'purchase_date' => '2024-03-10',
            'notes' => 'Needs GPU driver update'
        ]);
    }
}
