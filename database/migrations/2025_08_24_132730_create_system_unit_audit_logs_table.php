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
        Schema::create('system_unit_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('system_unit_id')->constrained()->onDelete('cascade');
            $table->string('event_type'); // 'status_change', 'field_update', 'assignment', 'creation', etc.
            $table->string('field_name')->nullable(); // Which field was changed (for field updates)
            $table->text('old_value')->nullable(); // Previous value
            $table->text('new_value')->nullable(); // New value
            $table->string('user_name'); // Name of user who made the change
            $table->unsignedBigInteger('user_id')->nullable(); // ID of user (if available)
            $table->text('description')->nullable(); // Human-readable description
            $table->json('metadata')->nullable(); // Additional context data
            $table->string('ip_address')->nullable(); // User's IP address
            $table->string('user_agent')->nullable(); // User's browser/client info
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['system_unit_id', 'created_at']);
            $table->index(['event_type', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_unit_audit_logs');
    }
};
