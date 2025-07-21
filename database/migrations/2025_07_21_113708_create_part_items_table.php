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
        Schema::create('part_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_delivery_id')->constrained()->onDelete('cascade');
            $table->string('serial_number')->unique()->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->enum('status', ['available', 'assigned', 'maintenance', 'retired'])->default('available');
            $table->string('assigned_to')->nullable(); // User or device
            $table->date('assigned_date')->nullable();
            $table->text('condition_notes')->nullable();
            $table->string('location')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_items');
    }
};
