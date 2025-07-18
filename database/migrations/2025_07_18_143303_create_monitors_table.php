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
        Schema::create('monitors', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number')->unique();
            $table->string('brand');
            $table->string('model');
            $table->string('size'); // e.g., "24", "27", "32"
            $table->string('resolution'); // e.g., "1920x1080", "2560x1440"
            $table->integer('refresh_rate')->nullable(); // e.g., 60, 75, 144
            $table->enum('status', ['working', 'not_working', 'under_repair', 'retired'])->default('working');
            $table->string('location'); // e.g., "storage", "office_a", "conference_room"
            $table->string('received_by');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitors');
    }
};
