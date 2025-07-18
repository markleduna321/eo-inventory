<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'name' => 'IT Department',
                'code' => 'S1-IT-001',
                'type' => 'Office',
                'building' => 'Site 1 - Main Campus',
                'floor' => '3rd Floor',
                'room' => '301',
                'capacity' => 30,
                'current_items' => 24,
                'manager' => 'John Smith',
                'status' => 'Active',
                'description' => 'Main IT department office space',
                'contact_info' => [
                    'phone' => '+1-555-0101',
                    'email' => 'it@company.com',
                    'extension' => '3301'
                ]
            ],
            [
                'name' => 'Executive Conference Room',
                'code' => 'S1-CR-001',
                'type' => 'Conference',
                'building' => 'Site 1 - Main Campus',
                'floor' => '10th Floor',
                'room' => '1001',
                'capacity' => 20,
                'current_items' => 15,
                'manager' => 'Sarah Johnson',
                'status' => 'Active',
                'description' => 'High-end conference room for executive meetings',
                'contact_info' => [
                    'phone' => '+1-555-0102',
                    'email' => 'exec@company.com',
                    'extension' => '1001'
                ]
            ],
            [
                'name' => 'Storage Room North',
                'code' => 'S2-STR-001',
                'type' => 'Storage',
                'building' => 'Site 2 - North Building',
                'floor' => 'Ground Floor',
                'room' => 'G-001',
                'capacity' => 150,
                'current_items' => 128,
                'manager' => 'Mike Davis',
                'status' => 'Active',
                'description' => 'Primary storage facility for IT equipment',
                'contact_info' => [
                    'phone' => '+1-555-0103',
                    'email' => 'storage@company.com',
                    'extension' => '2001'
                ]
            ],
            [
                'name' => 'Data Center Primary',
                'code' => 'S3-DC-001',
                'type' => 'Data Center',
                'building' => 'Site 3 - South Building',
                'floor' => 'Basement Level 1',
                'room' => 'B1-001',
                'capacity' => 200,
                'current_items' => 187,
                'manager' => 'Emily Chen',
                'status' => 'Active',
                'description' => 'Main data center with server racks and networking equipment',
                'contact_info' => [
                    'phone' => '+1-555-0104',
                    'email' => 'datacenter@company.com',
                    'extension' => '3001'
                ]
            ],
            [
                'name' => 'HR Department',
                'code' => 'S1-HR-001',
                'type' => 'Office',
                'building' => 'Site 1 - Main Campus',
                'floor' => '5th Floor',
                'room' => '501',
                'capacity' => 25,
                'current_items' => 18,
                'manager' => 'Tom Wilson',
                'status' => 'Active',
                'description' => 'Human Resources department office',
                'contact_info' => [
                    'phone' => '+1-555-0105',
                    'email' => 'hr@company.com',
                    'extension' => '5501'
                ]
            ],
            [
                'name' => 'Training Center A',
                'code' => 'S4-TC-001',
                'type' => 'Conference',
                'building' => 'Site 4 - West Building',
                'floor' => '2nd Floor',
                'room' => '201',
                'capacity' => 40,
                'current_items' => 32,
                'manager' => 'Lisa Brown',
                'status' => 'Active',
                'description' => 'Training facility with presentation equipment',
                'contact_info' => [
                    'phone' => '+1-555-0106',
                    'email' => 'training@company.com',
                    'extension' => '4201'
                ]
            ],
            [
                'name' => 'Backup Storage',
                'code' => 'S3-STR-002',
                'type' => 'Storage',
                'building' => 'Site 3 - South Building',
                'floor' => 'Basement Level 2',
                'room' => 'B2-005',
                'capacity' => 100,
                'current_items' => 45,
                'manager' => 'David Lee',
                'status' => 'Active',
                'description' => 'Secondary storage for backup equipment',
                'contact_info' => [
                    'phone' => '+1-555-0107',
                    'email' => 'backup@company.com',
                    'extension' => '3002'
                ]
            ],
            [
                'name' => 'Workshop Laboratory',
                'code' => 'S2-LAB-001',
                'type' => 'Laboratory',
                'building' => 'Site 2 - North Building',
                'floor' => '1st Floor',
                'room' => '101',
                'capacity' => 35,
                'current_items' => 28,
                'manager' => 'Rachel Green',
                'status' => 'Active',
                'description' => 'Technical workshop and testing laboratory',
                'contact_info' => [
                    'phone' => '+1-555-0108',
                    'email' => 'lab@company.com',
                    'extension' => '2101'
                ]
            ],
            [
                'name' => 'Maintenance Workshop',
                'code' => 'S4-WS-001',
                'type' => 'Workshop',
                'building' => 'Site 4 - West Building',
                'floor' => 'Basement',
                'room' => 'B-001',
                'capacity' => 50,
                'current_items' => 0,
                'manager' => 'Alex Turner',
                'status' => 'Under Maintenance',
                'description' => 'Equipment repair and maintenance workshop',
                'contact_info' => [
                    'phone' => '+1-555-0109',
                    'email' => 'maintenance@company.com',
                    'extension' => '4001'
                ]
            ],
            [
                'name' => 'Archive Storage',
                'code' => 'S1-STR-003',
                'type' => 'Storage',
                'building' => 'Site 1 - Main Campus',
                'floor' => 'Basement',
                'room' => 'B-010',
                'capacity' => 75,
                'current_items' => 12,
                'manager' => 'Maria Rodriguez',
                'status' => 'Inactive',
                'description' => 'Long-term archive storage for old equipment',
                'contact_info' => [
                    'phone' => '+1-555-0110',
                    'email' => 'archive@company.com',
                    'extension' => '1010'
                ]
            ]
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
