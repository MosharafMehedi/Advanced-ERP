<?php

namespace App\Http\Middleware;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
{
    $appName    = \App\Models\Setting::get('app_name', 'My App');
    $brandColor = \App\Models\Setting::get('brand_color', '#4f46e5');
    $brandLight = \App\Models\Setting::get('brand_light', '#e0e7ff');
    $logoUrl    = \App\Models\Setting::get('logo_path');
    $faviconUrl = \App\Models\Setting::get('favicon_path');

    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
        'globalSettings' => [
            'app_name'    => $appName,
            'brand_color' => $brandColor,
            'brand_light' => $brandLight,
            'logo_url'    => $logoUrl ? asset('storage/' . $logoUrl) : null,
            'favicon_url' => $faviconUrl ? asset('storage/' . $faviconUrl) : null,
        ],
    ];
}
}
