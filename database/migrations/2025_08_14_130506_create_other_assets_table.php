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
        Schema::create('other_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_type');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable()->unique();
            $table->text('description')->nullable();
            $table->json('specifications')->nullable();
            $table->string('condition_status')->default('Good');
            $table->unsignedBigInteger('location_id')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->string('status')->default('Active');
            $table->text('notes')->nullable();
            $table->string('qr_code')->nullable()->unique();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

                        // Indexes for better query performance (using shorter key lengths)
            $table->index(['status']);
            $table->index(['location_id', 'status']);
            $table->index(['assigned_to']);
            $table->index(['purchase_date']);
            $table->index(['warranty_expiry']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('other_assets');
    }
};
