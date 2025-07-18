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
        Schema::create('peripheral_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peripheral_id')->constrained()->onDelete('cascade');
            $table->integer('quantity_delivered');
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('purchase_order')->nullable();
            $table->string('invoice_number')->nullable();
            $table->date('delivery_date');
            $table->string('received_by');
            $table->text('notes')->nullable();
            $table->string('delivery_status')->default('received'); // received, damaged, returned
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peripheral_deliveries');
    }
};
