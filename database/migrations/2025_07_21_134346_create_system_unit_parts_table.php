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
        Schema::create('system_unit_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('system_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_item_id')->constrained()->onDelete('cascade'); // References specific part item
            $table->string('component_role'); // e.g., 'cpu', 'ram', 'storage', 'gpu', etc.
            $table->timestamps();
            
            // Ensure a part item can only be used once per system unit
            $table->unique(['system_unit_id', 'part_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_unit_parts');
    }
};
