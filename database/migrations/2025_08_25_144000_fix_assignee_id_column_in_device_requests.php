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
        // Check if foreign key exists and drop it
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'device_requests' 
            AND COLUMN_NAME = 'assignee_id' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        
        foreach ($foreignKeys as $fk) {
            DB::statement("ALTER TABLE device_requests DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
        }
        
        // Check if index exists and drop it
        $indexes = DB::select("
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'device_requests' 
            AND COLUMN_NAME = 'assignee_id'
            AND INDEX_NAME != 'PRIMARY'
        ");
        
        foreach ($indexes as $index) {
            try {
                DB::statement("ALTER TABLE device_requests DROP INDEX {$index->INDEX_NAME}");
            } catch (\Exception $e) {
                // Index might not exist, continue
            }
        }
        
        // Modify the column
        Schema::table('device_requests', function (Blueprint $table) {
            $table->string('assignee_id', 100)->nullable()->change();
        });
        
        // Add new index
        Schema::table('device_requests', function (Blueprint $table) {
            $table->index(['assignee_id', 'status'], 'device_requests_assignee_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('device_requests', function (Blueprint $table) {
            $table->dropIndex('device_requests_assignee_status_idx');
            $table->unsignedBigInteger('assignee_id')->nullable()->change();
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['assignee_id', 'status']);
        });
    }
};
