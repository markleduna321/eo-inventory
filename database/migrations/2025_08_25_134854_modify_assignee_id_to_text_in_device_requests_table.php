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
        Schema::table('device_requests', function (Blueprint $table) {
            // Drop the foreign key constraint using the correct constraint name
            $table->dropForeign('device_requests_assignee_id_foreign');
            
            // Drop the existing index
            $table->dropIndex('device_requests_assignee_id_status_index');
        });
        
        // Separate schema modification to change column type
        Schema::table('device_requests', function (Blueprint $table) {
            // Change the column type to string with shorter length
            $table->string('assignee_id', 100)->nullable()->change();
        });
        
        // Add new index in a separate schema call
        Schema::table('device_requests', function (Blueprint $table) {
            // Add a new index for the text field
            $table->index(['assignee_id', 'status'], 'device_requests_assignee_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('device_requests', function (Blueprint $table) {
            // Drop the new index
            $table->dropIndex('device_requests_assignee_status_idx');
        });
        
        // Change back to unsignedBigInteger
        Schema::table('device_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('assignee_id')->nullable()->change();
        });
        
        // Re-add the foreign key constraint and index
        Schema::table('device_requests', function (Blueprint $table) {
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['assignee_id', 'status']);
        });
    }
};
