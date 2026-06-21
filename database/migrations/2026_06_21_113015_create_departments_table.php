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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('department_code', 20)->unique();
            $table->string('name', 100);       
            $table->foreignId('branch_id')->nullable()->constrained('branches')->onDelete('set null');
            $table->unsignedBigInteger('dept_head_id')->nullable(); 
            $table->foreignId('entry_by')->nullable()->constrained('users')->nullOnDelete();
            $table->tinyInteger('status')->default(1)->comment('0=inactive, 1=active, 2=suspended')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
