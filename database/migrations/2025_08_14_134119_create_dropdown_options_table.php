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
        Schema::create('dropdown_options', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50); // asset_type, brand, model
            $table->string('value', 100);
            $table->string('category', 50)->default('other_assets'); // for future extensibility
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure unique combinations (using shorter hash for the value if needed)
            $table->unique(['type', 'value', 'category'], 'dropdown_unique_idx');
            
            // Indexes for performance
            $table->index(['type', 'category', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dropdown_options');
    }
};
