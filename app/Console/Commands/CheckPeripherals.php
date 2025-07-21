<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Peripheral;

class CheckPeripherals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:peripherals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check peripheral data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $peripherals = Peripheral::all();
        $this->info('Total peripherals: ' . $peripherals->count());
        
        foreach($peripherals as $p) {
            $this->line('ID: ' . $p->id . ', Type: ' . $p->type . ', Brand: ' . $p->brand . ', Model: ' . $p->model . ', Status: ' . $p->status);
        }
        
        $available = Peripheral::where('status', 'available')->count();
        $this->info('Available peripherals: ' . $available);
        
        return 0;
    }
}
