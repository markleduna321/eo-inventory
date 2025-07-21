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
            // Add a composite unique constraint that includes unassigned_at
            // This allows multiple rows for the same asset_type/asset_id as long as unassigned_at differs
            // Only one row can have unassigned_at = NULL (active assignment)
            $table->unique(['asset_type', 'asset_id', 'unassigned_at'], 'unique_asset_assignment_with_unassigned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('station_assets', function (Blueprint $table) {
            // Drop the constraint
            $table->dropUnique('unique_asset_assignment_with_unassigned');
        });
    }
};
