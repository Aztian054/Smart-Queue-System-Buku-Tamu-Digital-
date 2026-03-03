<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default admin user if not exists
        $adminExists = DB::table('users')->where('email', 'admin@bppmhkp.co.id')->exists();
        if (!$adminExists) {
            DB::table('users')->insert([
                'name' => 'Admin BPPMHKP',
                'email' => 'admin@bppmhkp.co.id',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert default services if not exists
        $services = [
            ['name' => 'Laboratorium', 'prefix' => 'LAB', 'description' => 'Layanan Laboratorium', 'sort_order' => 1],
            ['name' => 'Sertifikasi Mutu', 'prefix' => 'SM', 'description' => 'Layanan Sertifikasi Mutu', 'sort_order' => 2],
            ['name' => 'Konsultasi', 'prefix' => 'KON', 'description' => 'Layanan Konsultasi', 'sort_order' => 3],
            ['name' => 'Umum', 'prefix' => 'A', 'description' => 'Layanan Umum', 'sort_order' => 4],
        ];

        foreach ($services as $service) {
            $exists = DB::table('services')->where('prefix', $service['prefix'])->exists();
            if (!$exists) {
                DB::table('services')->insert(array_merge($service, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }

        // Insert default counters if not exists
        $counters = [
            ['name' => 'Loket Pendaftaran', 'number' => 1, 'service_id' => null],
            ['name' => 'Loket Laboratorium', 'number' => 2, 'service_id' => 1],
            ['name' => 'Loket Sertifikasi', 'number' => 3, 'service_id' => 2],
            ['name' => 'Loket Konsultasi', 'number' => 4, 'service_id' => 3],
        ];

        foreach ($counters as $counter) {
            $exists = DB::table('counters')->where('number', $counter['number'])->exists();
            if (!$exists) {
                DB::table('counters')->insert(array_merge($counter, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove default data
        DB::table('counters')->whereIn('number', [1, 2, 3, 4])->delete();
        DB::table('services')->whereIn('prefix', ['LAB', 'SM', 'KON', 'A'])->delete();
        DB::table('users')->where('email', 'admin@bppmhkp.co.id')->delete();
    }
};