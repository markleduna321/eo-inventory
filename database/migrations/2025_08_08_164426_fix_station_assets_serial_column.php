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
        // First, check if column exists and drop it if needed
        if (Schema::hasColumn('station_assets', 'serial_number')) {
            // Drop any existing indexes first
            try {
                DB::statement('ALTER TABLE station_assets DROP INDEX station_assets_asset_type_serial_number_index');
            } catch (Exception $e) {
                // Index might not exist, continue
            }
            
            Schema::table('station_assets', function (Blueprint $table) {
                $table->dropColumn('serial_number');
            });
        }
        
        // Now add the column properly
        Schema::table('station_assets', function (Blueprint $table) {
            $table->string('serial_number', 100)->nullable()->after('asset_id');
            $table->index('serial_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('station_assets', function (Blueprint $table) {
            $table->dropIndex(['serial_number']);
            $table->dropColumn('serial_number');
        });
    }
};
