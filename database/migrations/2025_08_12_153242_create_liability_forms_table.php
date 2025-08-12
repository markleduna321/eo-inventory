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
        Schema::create('liability_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('device_id')->constrained()->onDelete('cascade');
            $table->string('employee_name');
            $table->string('employee_id')->nullable();
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('device_condition_notes')->nullable();
            $table->json('accessories_received')->nullable(); // List of accessories
            $table->boolean('agrees_to_terms')->default(false);
            $table->text('signature_data'); // Base64 signature data
            $table->string('signature_format')->default('png'); // png, svg, etc.
            $table->timestamp('signed_at');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('terms_agreed')->nullable(); // Specific terms the user agreed to
            $table->timestamps();
            
            $table->index(['device_request_id']);
            $table->index(['user_id', 'device_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('liability_forms');
    }
};
