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
        Schema::create('part_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->onDelete('cascade');
            $table->integer('quantity_delivered');
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('purchase_order')->nullable();
            $table->string('invoice_number')->nullable();
            $table->date('delivery_date');
            $table->text('notes')->nullable();
            $table->string('received_by');
            $table->enum('delivery_status', ['pending', 'received', 'partial', 'cancelled'])->default('received');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_deliveries');
    }
};
