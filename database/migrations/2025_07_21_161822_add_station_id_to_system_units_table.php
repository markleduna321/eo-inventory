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
        Schema::table('system_units', function (Blueprint $table) {
            $table->unsignedBigInteger('station_id')->nullable()->after('location');
            $table->foreign('station_id')->references('id')->on('stations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_units', function (Blueprint $table) {
            $table->dropForeign(['station_id']);
            $table->dropColumn('station_id');
        });
    }
};
