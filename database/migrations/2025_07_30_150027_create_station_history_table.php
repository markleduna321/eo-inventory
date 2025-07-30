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
        Schema::create('station_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained()->onDelete('cascade');
            $table->string('action_type'); // 'create', 'update', 'bind', 'unbind'
            $table->string('asset_type')->nullable(); // 'monitor', 'system_unit', 'peripheral'
            $table->unsignedBigInteger('asset_id')->nullable(); // The ID of the asset
            $table->string('asset_name')->nullable(); // For easier reference without joins
            $table->string('asset_serial')->nullable(); // Serial number of the asset
            $table->string('unbind_reason')->nullable(); // 'Damaged', 'For Repair', 'Replace New'
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('station_history');
    }
};
