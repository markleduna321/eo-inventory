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
        Schema::table('liability_forms', function (Blueprint $table) {
            // Make fields nullable that are only filled when employee completes the form
            $table->string('employee_name')->nullable()->change();
            $table->text('signature_data')->nullable()->change();
            $table->timestamp('signed_at')->nullable()->change();
            $table->boolean('agrees_to_terms')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('liability_forms', function (Blueprint $table) {
            // Revert back to not nullable
            $table->string('employee_name')->nullable(false)->change();
            $table->text('signature_data')->nullable(false)->change();
            $table->timestamp('signed_at')->nullable(false)->change();
            $table->boolean('agrees_to_terms')->nullable(false)->change();
        });
    }
};
