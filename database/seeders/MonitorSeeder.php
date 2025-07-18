<?php

namespace Database\Seeders;

use App\Models\Monitor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MonitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $monitors = [
            [
                'serial_number' => 'DELL24U2419H001',
                'brand' => 'Dell',
                'model' => 'U2419H',
                'size' => '24',
                'resolution' => '1920x1080',
                'refresh_rate' => 60,
                'status' => 'working',
                'location' => 'storage',
                'received_by' => 'Mark Harvey',
                'notes' => 'In good condition, ready for deployment'
            ],
            [
                'serial_number' => 'LG27UL500002',
                'brand' => 'LG',
                'model' => '27UL500',
                'size' => '27',
                'resolution' => '3840x2160',
                'refresh_rate' => 60,
                'status' => 'working',
                'location' => 'office_a',
                'received_by' => 'Mark Harvey',
                'notes' => '4K monitor for design work'
            ],
            [
                'serial_number' => 'ASUS24VG248QE003',
                'brand' => 'ASUS',
                'model' => 'VG248QE',
                'size' => '24',
                'resolution' => '1920x1080',
                'refresh_rate' => 144,
                'status' => 'working',
                'location' => 'office_b',
                'received_by' => 'Mark Harvey',
                'notes' => 'Gaming monitor with high refresh rate'
            ],
            [
                'serial_number' => 'SAMSUNG32C32F391004',
                'brand' => 'Samsung',
                'model' => 'C32F391',
                'size' => '32',
                'resolution' => '1920x1080',
                'refresh_rate' => 60,
                'status' => 'under_repair',
                'location' => 'it_department',
                'received_by' => 'Mark Harvey',
                'notes' => 'Screen flickering issue, sent for repair'
            ],
            [
                'serial_number' => 'HP22KA005',
                'brand' => 'HP',
                'model' => '22ka',
                'size' => '22',
                'resolution' => '1920x1080',
                'refresh_rate' => 60,
                'status' => 'retired',
                'location' => 'storage',
                'received_by' => 'Mark Harvey',
                'notes' => 'Old monitor, kept for backup purposes'
            ]
        ];

        foreach ($monitors as $monitor) {
            Monitor::create($monitor);
        }
    }
}
