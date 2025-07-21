<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckIndexes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:indexes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check database indexes on station_assets table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $indexes = DB::select('SHOW INDEX FROM station_assets');
        
        $this->info('Indexes on station_assets table:');
        foreach($indexes as $index) {
            $this->line("{$index->Key_name} - Column: {$index->Column_name}, Unique: " . ($index->Non_unique ? 'No' : 'Yes'));
        }
        
        return 0;
    }
}
