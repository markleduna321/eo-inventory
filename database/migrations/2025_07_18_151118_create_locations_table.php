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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['Office', 'Conference', 'Storage', 'Data Center', 'Laboratory', 'Workshop', 'Other']);
            $table->string('building');
            $table->string('floor');
            $table->string('room');
            $table->integer('capacity');
            $table->integer('current_items')->default(0);
            $table->string('manager')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Under Maintenance'])->default('Active');
            $table->text('description')->nullable();
            $table->json('contact_info')->nullable(); // For phone, email, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
