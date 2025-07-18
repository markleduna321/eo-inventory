<?php

namespace Database\Seeders;

use App\Models\Peripheral;
use App\Models\PeripheralDelivery;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PeripheralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $peripherals = [
            [
                'type' => 'keyboard',
                'brand' => 'Logitech',
                'model' => 'K120',
                'description' => 'USB Wired Keyboard',
                'total_stock' => 50,
                'available_stock' => 45,
                'deployed_stock' => 5,
                'unit_price' => 25.99,
                'location' => 'IT Storage Room A',
                'received_by' => 'John Smith',
                'deliveries' => [
                    [
                        'quantity_delivered' => 30,
                        'unit_price' => 25.99,
                        'supplier' => 'TechWorld Supplies',
                        'delivery_date' => '2025-06-15',
                        'received_by' => 'John Smith',
                    ],
                    [
                        'quantity_delivered' => 20,
                        'unit_price' => 24.99,
                        'supplier' => 'Office Plus',
                        'delivery_date' => '2025-07-01',
                        'received_by' => 'Jane Doe',
                    ]
                ]
            ],
            [
                'type' => 'mouse',
                'brand' => 'Logitech',
                'model' => 'B100',
                'description' => 'USB Optical Mouse',
                'total_stock' => 60,
                'available_stock' => 52,
                'deployed_stock' => 7,
                'damaged_stock' => 1,
                'unit_price' => 15.99,
                'location' => 'IT Storage Room A',
                'received_by' => 'John Smith',
                'deliveries' => [
                    [
                        'quantity_delivered' => 40,
                        'unit_price' => 15.99,
                        'supplier' => 'TechWorld Supplies',
                        'delivery_date' => '2025-06-15',
                        'received_by' => 'John Smith',
                    ],
                    [
                        'quantity_delivered' => 20,
                        'unit_price' => 14.99,
                        'supplier' => 'Budget Tech',
                        'delivery_date' => '2025-07-05',
                        'received_by' => 'Jane Doe',
                    ]
                ]
            ],
            [
                'type' => 'headset',
                'brand' => 'Jabra',
                'model' => 'Evolve 20',
                'description' => 'Stereo Headset with Microphone',
                'total_stock' => 25,
                'available_stock' => 20,
                'deployed_stock' => 5,
                'unit_price' => 89.99,
                'location' => 'IT Storage Room B',
                'received_by' => 'Jane Doe',
                'deliveries' => [
                    [
                        'quantity_delivered' => 25,
                        'unit_price' => 89.99,
                        'supplier' => 'Audio Pro Solutions',
                        'delivery_date' => '2025-06-20',
                        'received_by' => 'Jane Doe',
                    ]
                ]
            ],
            [
                'type' => 'webcam',
                'brand' => 'Logitech',
                'model' => 'C920',
                'description' => 'HD Pro Webcam',
                'total_stock' => 15,
                'available_stock' => 12,
                'deployed_stock' => 3,
                'unit_price' => 79.99,
                'location' => 'IT Storage Room B',
                'received_by' => 'Mike Johnson',
                'deliveries' => [
                    [
                        'quantity_delivered' => 15,
                        'unit_price' => 79.99,
                        'supplier' => 'Camera World',
                        'delivery_date' => '2025-07-10',
                        'received_by' => 'Mike Johnson',
                    ]
                ]
            ],
            [
                'type' => 'speaker',
                'brand' => 'Creative',
                'model' => 'Pebble V2',
                'description' => 'USB Desktop Speakers',
                'total_stock' => 20,
                'available_stock' => 18,
                'deployed_stock' => 2,
                'unit_price' => 29.99,
                'location' => 'IT Storage Room A',
                'received_by' => 'Sarah Wilson',
                'deliveries' => [
                    [
                        'quantity_delivered' => 20,
                        'unit_price' => 29.99,
                        'supplier' => 'Audio Equipment Ltd',
                        'delivery_date' => '2025-07-08',
                        'received_by' => 'Sarah Wilson',
                    ]
                ]
            ]
        ];

        foreach ($peripherals as $peripheralData) {
            $deliveries = $peripheralData['deliveries'];
            unset($peripheralData['deliveries']);

            $peripheral = Peripheral::create($peripheralData);

            foreach ($deliveries as $deliveryData) {
                $peripheral->deliveries()->create($deliveryData);
            }
        }
    }
}
