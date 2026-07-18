<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // ইংরেজি দিনের নাম (Friday, Saturday, Sunday ইত্যাদি) স্টোর করা হবে।
            // এটা AttendanceService::isOffDay() এ Carbon::format('l') এর সাথে
            // সরাসরি strtolower() মিলিয়ে চেক করা হয়।
            $table->string('weekly_off_day')->nullable()->after('employment_type');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('weekly_off_day');
        });
    }
};