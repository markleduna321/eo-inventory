<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('liability_forms', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['device_request_id']);
            
            // Modify the column to be nullable
            $table->foreignId('device_request_id')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('device_request_id')
                  ->references('id')
                  ->on('device_requests')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('liability_forms', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['device_request_id']);
            
            // Make the column not nullable again
            $table->foreignId('device_request_id')->nullable(false)->change();
            
            // Re-add the foreign key constraint
            $table->foreign('device_request_id')
                  ->references('id')
                  ->on('device_requests')
                  ->onDelete('cascade');
        });
    }
};
