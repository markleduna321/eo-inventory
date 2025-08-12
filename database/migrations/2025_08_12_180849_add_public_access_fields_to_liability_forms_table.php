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
            $table->string('public_token', 64)->nullable()->unique()->after('ip_address');
            $table->boolean('is_public_form')->default(false)->after('public_token');
            $table->boolean('is_completed')->default(false)->after('is_public_form');
            $table->timestamp('public_token_expires_at')->nullable()->after('is_completed');
            $table->json('admin_prefilled_data')->nullable()->after('public_token_expires_at');
            $table->string('required_employee_id')->nullable()->after('admin_prefilled_data');
            $table->timestamp('accessed_at')->nullable()->after('required_employee_id');
            $table->timestamp('completed_at')->nullable()->after('accessed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('liability_forms', function (Blueprint $table) {
            $table->dropColumn([
                'public_token',
                'is_public_form',
                'is_completed',
                'public_token_expires_at',
                'admin_prefilled_data',
                'required_employee_id',
                'accessed_at',
                'completed_at'
            ]);
        });
    }
};
