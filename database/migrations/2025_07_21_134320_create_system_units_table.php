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
        Schema::create('system_units', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number')->unique();
            $table->string('system_name');
            $table->enum('unit_type', ['pre_built', 'custom_built']); // Pre-built or custom built from parts
            $table->string('brand')->nullable(); // For pre-built units
            $table->string('model')->nullable(); // For pre-built units
            $table->text('description')->nullable();
            $table->string('operating_system')->nullable();
            $table->enum('status', ['available', 'assigned', 'maintenance', 'retired'])->default('available');
            $table->string('location');
            $table->string('assigned_to')->nullable();
            $table->string('received_by');
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->text('notes')->nullable();
            
            // Component specifications (for pre-built or final specs for custom built)
            $table->json('specifications')->nullable(); // Store CPU, RAM, Storage, etc.
            
            // QR Code for quick access
            $table->string('qr_code')->unique()->nullable(); // Unique QR code identifier
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_units');
    }
};
