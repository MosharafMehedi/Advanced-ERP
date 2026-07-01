<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@erp.com',
            ],
            [
                'employee_id'      => 'EMP001',
                'name'             => 'Super Admin',
                'phone'            => '01700000000',
                'role_id'          => 1,
                'branch_id'        => 1,
                'department_id'    => 1,
                'status'           => 1,
                'email_verified_at'=> now(),
                'password'         => Hash::make('password'),
                'last_login_at'    => null,
                'entry_by'         => null,
            ]
        );
    }
}