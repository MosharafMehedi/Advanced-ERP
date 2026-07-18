<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    
    // User CRUD resource route
    Route::resource('users', UserController::class);
    Route::resource('settings', SettingController::class);
    Route::resource('departments', DepartmentController::class);
    Route::resource('branches', BranchController::class);
    Route::resource('designations', DesignationController::class);
    Route::resource('employees', EmployeeController::class);
    Route::resource('payrolls', PayrollController::class);
    Route::resource('attendances', AttendanceController::class);
    Route::resource('shifts', ShiftController::class);
    Route::resource('holidays', HolidayController::class);

    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn'])->name('attendances.checkIn');
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut'])->name('attendances.checkOut');
    Route::get('attendances/summary/{employee}/{year}/{month}', [AttendanceController::class, 'monthlySummary'])->name('attendances.summary');

});

require __DIR__.'/auth.php';
