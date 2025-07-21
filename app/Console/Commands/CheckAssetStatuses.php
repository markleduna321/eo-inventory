<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Monitor;
use App\Models\SystemUnit;
use App\Models\Peripheral;

class CheckAssetStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:asset-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check status values across different asset types';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== MONITORS ===');
        $monitors = Monitor::select('status')->distinct()->get();
        foreach($monitors as $m) {
            $count = Monitor::where('status', $m->status)->count();
            $this->line("Status: {$m->status} - Count: {$count}");
        }
        
        $this->info('=== SYSTEM UNITS ===');
        $systemUnits = SystemUnit::select('status')->distinct()->get();
        foreach($systemUnits as $s) {
            $count = SystemUnit::where('status', $s->status)->count();
            $this->line("Status: {$s->status} - Count: {$count}");
        }
        
        $this->info('=== PERIPHERALS ===');
        $peripherals = Peripheral::select('status')->distinct()->get();
        foreach($peripherals as $p) {
            $count = Peripheral::where('status', $p->status)->count();
            $this->line("Status: {$p->status} - Count: {$count}");
        }
        
        return 0;
    }
}
