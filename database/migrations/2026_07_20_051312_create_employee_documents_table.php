<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_documents', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('employee_id')->constrained()->onDelete('cascade');
            $blueprint->string('document_type'); // e.g., NID, Passport, Certificate, Appointment Letter
            $blueprint->string('title'); // e.g., 'MM_NID_Card'
            $blueprint->string('file_path')->nullable(); // Storage path
            $blueprint->string('file_type')->nullable(); // pdf, png, jpg etc.
            $blueprint->date('expiry_date')->nullable(); // For Passport/Visas
            $blueprint->enum('status', ['Valid', 'Expired', 'Pending_Verification'])->default('Valid');
            $blueprint->text('notes')->nullable();
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};