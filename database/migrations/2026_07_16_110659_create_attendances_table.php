<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. SHIFTS — fixed start/end time per shift, employees are assigned one
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('grace_minutes')->default(15);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
        });

        // 2. ATTENDANCES
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();

            $table->date('date')->index();
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();

            // Present, Absent, Late, Leave, Holiday, Weekend
            $table->string('status', 20)->default('Absent')->index();

            $table->integer('late_minutes')->default(0);
            $table->integer('early_leaving_minutes')->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0.00);
            $table->integer('total_working_minutes')->default(0);

            // manual (HR/admin punched it), self (employee punched it), device (biometric import)
            $table->string('source', 20)->default('manual');
            $table->string('ip_address', 45)->nullable();
            $table->string('device_id')->nullable();
            $table->text('remarks')->nullable();

            // Placeholder FK for the upcoming Leave module — no constraint yet since
            // the leave_requests table doesn't exist. Wire it up when that module lands.
            $table->unsignedBigInteger('leave_request_id')->nullable();

            $table->foreignId('entry_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shift_id');
        });
        Schema::dropIfExists('shifts');
    }
};
