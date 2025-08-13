<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reset:passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset passwords for test users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Update the test user password
        $user = User::where('email', 'testuser@example.com')->first();
        if ($user) {
            $user->password = Hash::make('password');
            $user->save();
            $this->info("Password for testuser@example.com has been reset to 'password'");
        } else {
            $this->error("Test user not found");
        }

        // Update the admin user password
        $admin = User::where('email', 'admin@gmail.com')->first();
        if ($admin) {
            $admin->password = Hash::make('password');
            $admin->save();
            $this->info("Password for admin@gmail.com has been reset to 'password'");
        } else {
            $this->error("Admin user not found");
        }

        $this->info("Password reset completed!");
    }
}
