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
        Schema::create('designations', function (Blueprint $table) {
            $table->id();
            $table->string('designation_code', 20)->unique();
            $table->string('title', 100);
            $table->text('description')->nullable();
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
        Schema::dropIfExists('designations');
    }
};
