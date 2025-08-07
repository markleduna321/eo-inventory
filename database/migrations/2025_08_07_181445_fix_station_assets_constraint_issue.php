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
        Schema::table('station_assets', function (Blueprint $table) {
            // Check existing indexes and constraints first
            $indexes = DB::select("SHOW INDEX FROM station_assets");
            $indexNames = collect($indexes)->pluck('Key_name')->toArray();
            
            // Drop existing problematic constraints if they exist
            if (in_array('unique_asset_assignment', $indexNames)) {
                $table->dropUnique('unique_asset_assignment');
            }
            
            if (in_array('unique_asset_assignment_with_unassigned', $indexNames)) {
                $table->dropUnique('unique_asset_assignment_with_unassigned');
            }
            
            // Add a performance index for lookups
            if (!in_array('idx_station_assets_lookup', $indexNames)) {
                $table->index(['asset_type', 'asset_id', 'unassigned_at'], 'idx_station_assets_lookup');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('station_assets', function (Blueprint $table) {
            $table->dropIndex('idx_station_assets_lookup');
        });
    }
};
