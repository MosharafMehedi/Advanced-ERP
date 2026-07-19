<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. LEAVE TYPES — master data (Casual, Sick, Earned, etc.)
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 10)->unique(); // CL, SL, EL
            $table->decimal('days_per_year', 5, 1)->default(0);
            $table->boolean('is_paid')->default(true);
            $table->boolean('carry_forward_allowed')->default(false);
            $table->decimal('max_carry_forward_days', 5, 1)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. LEAVE BALANCES — one row per employee, per leave type, per year
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');
            $table->integer('year');

            $table->decimal('allocated', 5, 1)->default(0);
            $table->decimal('carried_forward', 5, 1)->default(0);
            $table->decimal('used', 5, 1)->default(0);
            $table->decimal('pending', 5, 1)->default(0); // reserved by not-yet-decided requests

            $table->timestamps();

            $table->unique(['employee_id', 'leave_type_id', 'year']);
        });

        // 3. LEAVE REQUESTS — the workflow table
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');

            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 1);
            $table->text('reason')->nullable();

            // Pending -> Manager Approved -> Approved (final) / Rejected / Cancelled
            $table->string('status', 20)->default('Pending')->index();
            $table->boolean('is_half_day')->default(false);
            $table->string('half_day_period', 10)->nullable();

            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->timestamp('manager_action_at')->nullable();
            $table->string('manager_remarks')->nullable();

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('hr_remarks')->nullable();

            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_types');
    }
};