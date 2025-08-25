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
        Schema::create('device_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('returner_name'); // Name of person returning (could be assignee or someone else)
            $table->string('previous_assignee'); // Who was previously assigned the device
            $table->string('return_reason'); // resignation, termination, replacement, etc.
            $table->text('return_notes')->nullable(); // Additional notes about the return
            $table->json('condition_check'); // Device condition assessment
            $table->string('received_by'); // Who processed the return
            $table->boolean('has_issues')->default(false); // Any issues found during return
            $table->text('issues_description')->nullable(); // Description of any issues
            $table->string('new_status'); // working, needs_repair, damaged, disposed
            $table->decimal('repair_cost', 10, 2)->nullable(); // If repair is needed
            $table->boolean('approved_by_supervisor')->default(false);
            $table->string('supervisor_name')->nullable();
            $table->text('supervisor_notes')->nullable();
            $table->timestamp('returned_at');
            $table->timestamps();
            
            $table->index(['device_id', 'returned_at']);
            $table->index('return_reason');
            $table->index('new_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_returns');
    }
};
