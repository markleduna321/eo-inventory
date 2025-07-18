<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\Location;

class StationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some locations to assign to stations
        $locations = Location::all();
        
        if ($locations->isEmpty()) {
            $this->command->info('No locations found. Please run LocationSeeder first.');
            return;
        }

        $stations = [
            [
                'name' => 'Executive Office - CEO',
                'code' => 'EXE-CEO-001',
                'type' => 'executive',
                'department' => 'Executive',
                'location_id' => $locations->where('type', 'Office')->first()->id ?? $locations->first()->id,
                'assigned_user' => 'John Smith',
                'description' => 'Chief Executive Officer workstation with premium setup',
                'status' => 'active'
            ],
            [
                'name' => 'IT Manager Station',
                'code' => 'MGR-IT-001',
                'type' => 'manager',
                'department' => 'IT Department',
                'location_id' => $locations->where('type', 'Office')->skip(1)->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Sarah Johnson',
                'description' => 'IT Department manager workstation',
                'status' => 'active'
            ],
            [
                'name' => 'Developer Workstation A1',
                'code' => 'EMP-DEV-A01',
                'type' => 'employee',
                'department' => 'IT Department',
                'location_id' => $locations->where('type', 'Office')->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Mike Wilson',
                'description' => 'Software developer workstation with dual monitor setup',
                'status' => 'active'
            ],
            [
                'name' => 'Developer Workstation A2',
                'code' => 'EMP-DEV-A02',
                'type' => 'employee',
                'department' => 'IT Department',
                'location_id' => $locations->where('type', 'Office')->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Lisa Chen',
                'description' => 'Software developer workstation',
                'status' => 'active'
            ],
            [
                'name' => 'HR Manager Office',
                'code' => 'MGR-HR-001',
                'type' => 'manager',
                'department' => 'Human Resources',
                'location_id' => $locations->skip(2)->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Jennifer Davis',
                'description' => 'HR Department manager office setup',
                'status' => 'active'
            ],
            [
                'name' => 'Finance Analyst Station',
                'code' => 'EMP-FIN-001',
                'type' => 'employee',
                'department' => 'Finance',
                'location_id' => $locations->skip(3)->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Robert Brown',
                'description' => 'Financial analyst workstation',
                'status' => 'active'
            ],
            [
                'name' => 'Conference Room A Station',
                'code' => 'MTG-CONF-A01',
                'type' => 'meeting',
                'department' => 'Shared',
                'location_id' => $locations->where('type', 'Conference')->first()->id ?? $locations->first()->id,
                'assigned_user' => null,
                'description' => 'Presentation station for Conference Room A',
                'status' => 'active'
            ],
            [
                'name' => 'Reception Desk Main',
                'code' => 'REC-MAIN-001',
                'type' => 'reception',
                'department' => 'Administration',
                'location_id' => $locations->skip(4)->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Amanda White',
                'description' => 'Main reception desk workstation',
                'status' => 'active'
            ],
            [
                'name' => 'Hot Desk Zone A1',
                'code' => 'HOT-ZONE-A01',
                'type' => 'hotdesk',
                'department' => 'Shared',
                'location_id' => $locations->skip(5)->first()->id ?? $locations->first()->id,
                'assigned_user' => null,
                'description' => 'Flexible hot desk for temporary assignments',
                'status' => 'active'
            ],
            [
                'name' => 'Technical Bench Lab1',
                'code' => 'TEC-LAB1-001',
                'type' => 'technical',
                'department' => 'IT Department',
                'location_id' => $locations->where('type', 'Laboratory')->first()->id ?? $locations->first()->id,
                'assigned_user' => 'David Martinez',
                'description' => 'Hardware testing and repair workbench',
                'status' => 'active'
            ],
            [
                'name' => 'Marketing Designer Station',
                'code' => 'EMP-MKT-001',
                'type' => 'employee',
                'department' => 'Marketing',
                'location_id' => $locations->skip(6)->first()->id ?? $locations->first()->id,
                'assigned_user' => 'Emily Rodriguez',
                'description' => 'Graphic designer workstation with high-res monitors',
                'status' => 'active'
            ],
            [
                'name' => 'Maintenance Station',
                'code' => 'TEC-MAINT-001',
                'type' => 'technical',
                'department' => 'Operations',
                'location_id' => $locations->where('type', 'Workshop')->first()->id ?? $locations->first()->id,
                'assigned_user' => null,
                'description' => 'Equipment maintenance and service station',
                'status' => 'maintenance'
            ]
        ];

        foreach ($stations as $stationData) {
            Station::create($stationData);
        }

        $this->command->info('Created ' . count($stations) . ' stations');
    }
}
