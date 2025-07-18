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
        Schema::create('peripherals', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // keyboard, mouse, speaker, etc.
            $table->string('brand');
            $table->string('model');
            $table->text('description')->nullable();
            $table->integer('total_stock')->default(0); // Total units received
            $table->integer('available_stock')->default(0); // Available units
            $table->integer('deployed_stock')->default(0); // Currently deployed
            $table->integer('damaged_stock')->default(0); // Damaged/unusable
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->string('location')->default('storage'); // Where stock is stored
            $table->string('status')->default('active'); // active, discontinued
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
        Schema::dropIfExists('peripherals');
    }
};
