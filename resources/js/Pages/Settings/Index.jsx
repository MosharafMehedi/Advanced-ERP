import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiSettings, FiSave, FiUploadCloud, FiMapPin, FiPhone, FiImage } from 'react-icons/fi';
import Swal from 'sweetalert2';

function swalTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#0f172a' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
    };
}

export default function Index({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || '',
        company_address: settings.company_address || '',
        helpline: settings.helpline || '',
        logo: null,
        favicon: null,
        login_image: null,
        report_image: null,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('settings.update', 'global'), {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Configuration Saved!',
                    text: 'System core settings updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#1d4ed8',
                    ...swalTheme(),
                });
            },
        });
    };

    const getPreviewUrl = (file, fallbackUrl) => {
        if (file) {
            return URL.createObjectURL(file);
        }
        if (fallbackUrl) {
            return fallbackUrl.startsWith('http') || fallbackUrl.startsWith('/storage')
                ? fallbackUrl
                : `/storage/${fallbackUrl}`;
        }
        return null;
    };

    const UploadField = ({ label, field, preview, dimensionHint }) => (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-700 rounded-sm p-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                {label}
            </label>
            <div className="h-16 w-full flex items-center justify-center mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm">
                {preview ? (
                    <img src={preview} alt={`${label} preview`} className="h-12 w-auto object-contain" />
                ) : (
                    <div className="flex items-center gap-1.5 text-slate-300 dark:text-slate-700">
                        <FiImage className="h-4 w-4" />
                        <span className="text-xs">No file uploaded</span>
                    </div>
                )}
            </div>
            <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                <FiUploadCloud className="h-3.5 w-3.5" />
                Choose File
                <input
                    type="file"
                    onChange={(e) => setData(field, e.target.files[0])}
                    className="hidden"
                    accept="image/*"
                />
            </label>
            {dimensionHint && (
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 text-center">{dimensionHint}</p>
            )}
            {data[field] && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium truncate text-center">
                    Selected: {data[field].name}
                </p>
            )}
            {errors[field] && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 text-center">{errors[field]}</p>}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Global Configuration Center</h2>}
        >
            <Head title="System Settings" />

            <div className="min-h-full bg-slate-100 dark:bg-slate-950 -m-4 sm:-m-6 p-4 sm:p-6 transition-colors">
                <div className="mx-auto max-w-5xl">
                    {/* Page header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-blue-700 text-white shrink-0">
                                <FiSettings className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Administration &nbsp;›&nbsp; Settings
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    System Configuration
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm px-3 py-2">
                            <span className="text-slate-400 dark:text-slate-500">Scope</span>
                            <span className="text-slate-900 dark:text-white text-sm">Global</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Main panel */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-sm">
                            {/* Section: General Information */}
                            <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
                                <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                    General Information
                                </h3>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 dark:border-slate-800">
                                {/* Application Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                                        Application Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.app_name}
                                        onChange={(e) => setData('app_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors"
                                    />
                                    {errors.app_name && <div className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{errors.app_name}</div>}
                                </div>

                                {/* Helpline */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                                        <FiPhone className="h-3.5 w-3.5 text-slate-400" /> Helpline / Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.helpline}
                                        onChange={(e) => setData('helpline', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors"
                                        placeholder="e.g., +880 123456789"
                                    />
                                    {errors.helpline && <div className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{errors.helpline}</div>}
                                </div>

                                {/* Company Address */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                                        <FiMapPin className="h-3.5 w-3.5 text-slate-400" /> Company Address
                                    </label>
                                    <textarea
                                        value={data.company_address}
                                        onChange={(e) => setData('company_address', e.target.value)}
                                        rows="3"
                                        className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus:border-blue-600 dark:text-slate-200 transition-colors resize-none"
                                        placeholder="Enter company full physical address..."
                                    />
                                    {errors.company_address && (
                                        <div className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{errors.company_address}</div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Brand Assets */}
                            <div className="px-5 py-3.5 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60">
                                <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                    Brand Assets
                                </h3>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <UploadField
                                    label="System Main Logo"
                                    field="logo"
                                    preview={getPreviewUrl(data.logo, settings.logo_url)}
                                    dimensionHint="Recommended: transparent PNG, 240×64px"
                                />
                                <UploadField
                                    label="Browser Favicon"
                                    field="favicon"
                                    preview={getPreviewUrl(data.favicon, settings.favicon_url)}
                                    dimensionHint="Recommended: square PNG/ICO, 32×32px"
                                />
                                <UploadField
                                    label="Login Page Banner Image"
                                    field="login_image"
                                    preview={getPreviewUrl(data.login_image, settings.login_image_url)}
                                    dimensionHint="Recommended: 1200×800px"
                                />
                                <UploadField
                                    label="Report Header Banner / Watermark"
                                    field="report_image"
                                    preview={getPreviewUrl(data.report_image, settings.report_image_url)}
                                    dimensionHint="Recommended: wide banner, low-opacity friendly"
                                />
                            </div>

                            {/* Submit */}
                            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="h-4 w-4" />
                                    {processing ? 'Saving Configurations...' : 'Apply & Save Settings'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
