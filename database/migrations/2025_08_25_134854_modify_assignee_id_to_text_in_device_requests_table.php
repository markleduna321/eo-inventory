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
            // Drop the foreign key constraint first
            $table->dropForeign(['assignee_id']);
            $table->dropIndex(['assignee_id', 'status']);
            
            // Change the column type to string with shorter length
            $table->string('assignee_id', 100)->nullable()->change();
            
            // Add a new index for the text field with shorter length
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
            
            // Change back to unsignedBigInteger (this will require manual data migration)
            $table->unsignedBigInteger('assignee_id')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['assignee_id', 'status']);
        });
    }
};
