<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Device;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $devices = [
            [
                'serial_number' => 'HP123456789',
                'device_type' => 'Laptop',
                'brand' => 'HP',
                'model' => 'HP Zenbook 10',
                'operating_system' => 'Windows 10',
                'status' => 'Working',
                'issued_to' => null,
                'received_by' => 'Mark Harvey',
            ],
            [
                'serial_number' => 'APPLE987654321',
                'device_type' => 'MAC',
                'brand' => 'Apple',
                'model' => 'MacBook Air',
                'operating_system' => 'macOS',
                'status' => 'Defective',
                'issued_to' => null,
                'received_by' => 'Mark Harvey',
            ],
            [
                'serial_number' => 'MSI456789123',
                'device_type' => 'Laptop',
                'brand' => 'MSI',
                'model' => 'Gaming Pro 3',
                'operating_system' => 'Windows 11',
                'status' => 'Working',
                'issued_to' => 'Mark Harvey',
                'received_by' => 'Mark Harvey',
            ],
            [
                'serial_number' => 'IPHONE123789',
                'device_type' => 'Mobile Phone',
                'brand' => 'Apple',
                'model' => 'iPhone 14',
                'operating_system' => 'iOS 16',
                'status' => 'Working',
                'issued_to' => 'Test Regular User',
                'received_by' => 'Mark Harvey',
            ],
            [
                'serial_number' => 'AIRPODS456123',
                'device_type' => 'Airpods',
                'brand' => 'Apple',
                'model' => 'AirPods Pro',
                'operating_system' => null,
                'status' => 'For Repair',
                'issued_to' => null,
                'received_by' => 'Mark Harvey',
            ],
        ];

        foreach ($devices as $device) {
            Device::create($device);
        }
    }
}
