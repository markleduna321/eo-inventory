<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PartTransaction;
use App\Models\Part;
use App\Models\User;

class PartTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parts = Part::all();
        $user = User::first();

        if ($parts->count() > 0 && $user) {
            // Create sample transactions for each part
            foreach ($parts as $index => $part) {
                // Initial stock addition
                PartTransaction::create([
                    'part_id' => $part->id,
                    'transaction_type' => 'add_stock',
                    'quantity' => 50 + ($index * 10),
                    'user_id' => $user->id,
                    'notes' => 'Initial stock addition for ' . $part->name,
                    'created_at' => now()->subDays(30 - $index),
                ]);

                // Some usage
                PartTransaction::create([
                    'part_id' => $part->id,
                    'transaction_type' => 'remove_stock',
                    'quantity' => 5 + ($index * 2),
                    'user_id' => $user->id,
                    'notes' => 'Used for maintenance work',
                    'created_at' => now()->subDays(15 - $index),
                ]);

                // Recent restock
                if ($index % 2 === 0) {
                    PartTransaction::create([
                        'part_id' => $part->id,
                        'transaction_type' => 'add_stock',
                        'quantity' => 20,
                        'user_id' => $user->id,
                        'notes' => 'New shipment received',
                        'created_at' => now()->subDays(5),
                    ]);
                }
            }

            $this->command->info('Created sample part transactions');
        } else {
            $this->command->warn('No parts or users found. Please run PartSeeder and UserSeeder first.');
        }
    }
}
