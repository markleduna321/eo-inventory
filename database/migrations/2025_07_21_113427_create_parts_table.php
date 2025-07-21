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
        Schema::create('parts', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // RAM, SSD, GPU, CPU, etc.
            $table->string('brand');
            $table->string('model');
            $table->text('description')->nullable();
            $table->json('specifications')->nullable(); // Store specs as JSON (capacity, speed, etc.)
            $table->string('location')->default('storage');
            $table->integer('total_stock')->default(0);
            $table->integer('available_stock')->default(0);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->string('received_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts');
    }
};
