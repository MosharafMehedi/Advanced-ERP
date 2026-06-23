<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="icon" type="image/x-icon"
        href="{{ isset($page['props']['globalSettings']['favicon_url']) ? $page['props']['globalSettings']['favicon_url'] : asset('company/favicon.ico') }}" />

    <title inertia>
        {{ isset($page['props']['globalSettings']['app_name']) ? $page['props']['globalSettings']['app_name'] : config('app.name', 'Laravel') }}
    </title>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    
    <script>
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    </script>
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>