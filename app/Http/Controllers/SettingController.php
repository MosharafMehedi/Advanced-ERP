<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * Display the resource main form.
     */
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->all();

        return Inertia::render('Settings/Index', [
            'settings' => [
                'app_name' => $settings['app_name'] ?? 'CoreERP',
                'company_address' => $settings['company_address'] ?? '',
                'helpline' => $settings['helpline'] ?? '',
                'logo_url' => isset($settings['logo_path']) ? Storage::url($settings['logo_path']) : null,
                'favicon_url' => isset($settings['favicon_path']) ? Storage::url($settings['favicon_path']) : null,
                'login_image_url' => isset($settings['login_image_path']) ? Storage::url($settings['login_image_path']) : null,
                'report_image_url' => isset($settings['report_image_path']) ? Storage::url($settings['report_image_path']) : null,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'company_address' => 'nullable|string|max:500',
            'helpline' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048',
            'favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg|max:512',
            'login_image' => 'nullable|image|max:3072',
            'report_image' => 'nullable|image|max:3072',
        ]);

        DB::transaction(function () use ($request) {
            // ১. টেক্সট বেসড কি-ভ্যালু পেয়ার সিঙ্ক
            Setting::updateOrCreate(['key' => 'app_name'], ['value' => $request->app_name]);
            Setting::updateOrCreate(['key' => 'company_address'], ['value' => $request->company_address]);
            Setting::updateOrCreate(['key' => 'helpline'], ['value' => $request->helpline]);

            // ২. লোগো আপলোড হ্যান্ডেল
            if ($request->hasFile('logo')) {
                $this->deleteOldFile('logo_path');
                $path = $request->file('logo')->store('settings', 'public');
                Setting::updateOrCreate(['key' => 'logo_path'], ['value' => $path]);
            }

            // ৩. ফেভিকন আপলোড হ্যান্ডেল
            if ($request->hasFile('favicon')) {
                $this->deleteOldFile('favicon_path');
                $path = $request->file('favicon')->store('settings', 'public');
                Setting::updateOrCreate(['key' => 'favicon_path'], ['value' => $path]);
            }

            // ৪. লগইন ইমেজ আপলোড হ্যান্ডেল
            if ($request->hasFile('login_image')) {
                $this->deleteOldFile('login_image_path');
                $path = $request->file('login_image')->store('settings', 'public');
                Setting::updateOrCreate(['key' => 'login_image_path'], ['value' => $path]);
            }

            // ৫. রিপোর্ট ইমেজ আপলোড হ্যান্ডেল
            if ($request->hasFile('report_image')) {
                $this->deleteOldFile('report_image_path');
                $path = $request->file('report_image')->store('settings', 'public');
                Setting::updateOrCreate(['key' => 'report_image_path'], ['value' => $path]);
            }
        });

        return redirect()->route('settings.index')->with('success', 'Global configurations updated successfully.');
    }

    /**
     * ওল্ড ফাইল ক্লিনআপ করার জন্য প্রাইভেট মেথড (DRY Principle)
     */
    private function deleteOldFile(string $key): void
    {
        // আপনার Setting মডেলের স্ট্রাকচার অনুযায়ী ভ্যালু তুলে আনা
        $oldSetting = Setting::where('key', $key)->first();
        if ($oldSetting && $oldSetting->value && Storage::disk('public')->exists($oldSetting->value)) {
            Storage::disk('public')->delete($oldSetting->value);
        }
    }
}