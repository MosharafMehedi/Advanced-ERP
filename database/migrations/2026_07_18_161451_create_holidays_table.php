<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('title');           // e.g. "Independence Day"
            $table->date('date');
            // branch_id null রাখলে holiday-টা সব শাখার জন্য প্রযোজ্য হবে;
            // নির্দিষ্ট branch_id দিলে শুধু সেই শাখার জন্যই কাউন্ট হবে।
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['date', 'branch_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};