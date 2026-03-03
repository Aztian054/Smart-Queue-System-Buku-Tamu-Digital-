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
        Schema::create('daily_counters', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->integer('last_number')->default(0);
            $table->timestamps();
            
            $table->unique(['date', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_counters');
    }
};