<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Station;

class ListStations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'list:stations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all stations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $stations = Station::all();
        foreach($stations as $station) {
            $this->line("ID: {$station->id} | Name: {$station->name}");
        }
        
        return 0;
    }
}
