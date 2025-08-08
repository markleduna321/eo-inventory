<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all indexes first
        $indexes = DB::select("SHOW INDEX FROM station_assets");
        $indexNames = collect($indexes)->pluck('Key_name')->unique()->toArray();
        
        Schema::table('station_assets', function (Blueprint $table) use ($indexNames) {
            // Drop existing constraints if they exist
            if (in_array('unique_asset_assignment', $indexNames)) {
                $table->dropUnique('unique_asset_assignment');
            }
            
            if (in_array('unique_asset_assignment_with_unassigned', $indexNames)) {
                $table->dropUnique('unique_asset_assignment_with_unassigned');
            }
        });

        // Add a new constraint that allows multiple peripheral assignments
        // For peripherals without serial numbers, we'll use a different approach
        // For now, let's remove all unique constraints to allow multiple assignments
        // and handle uniqueness in application logic
        
        // Note: This allows multiple assignments but we'll control it in the application
        // We could add a partial unique index later if needed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the custom index
        DB::statement('DROP INDEX unique_assignment_constraint ON station_assets');
        
        // Restore the original constraint
        Schema::table('station_assets', function (Blueprint $table) {
            $table->unique(['asset_type', 'asset_id', 'unassigned_at'], 'unique_asset_assignment_with_unassigned');
        });
    }
};
