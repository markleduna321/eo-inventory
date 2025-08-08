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
        Schema::create('peripheral_serials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peripheral_id')->constrained()->onDelete('cascade');
            $table->string('serial_number')->unique(); // Global unique constraint
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->enum('status', ['available', 'deployed', 'damaged', 'maintenance'])->default('available');
            $table->string('deployed_to')->nullable(); // Person/department name
            $table->foreignId('station_id')->nullable()->constrained()->onDelete('set null');
            $table->date('deployed_at')->nullable();
            $table->date('returned_at')->nullable();
            $table->date('delivery_date')->nullable(); // When this specific serial was received
            $table->foreignId('delivery_id')->nullable()->constrained('peripheral_deliveries')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index for faster queries
            $table->index(['peripheral_id', 'status']);
            $table->index('serial_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peripheral_serials');
    }
};
