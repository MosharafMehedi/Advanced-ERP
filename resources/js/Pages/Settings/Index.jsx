import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiSettings, FiSave, FiUploadCloud, FiMapPin, FiPhone } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function Index({ settings }) {
    // 💡 ফর্ম স্টেটে কালার বাদ দিয়ে নতুন ফিল্ডগুলো যুক্ত করা হলো
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
                    confirmButtonColor: '#394e5a', // ডিফল্ট থিম কালার সেভ বাটনের জন্য
                });
            },
        });
    };

    // 👈 ফাইল প্রিভিউ জেনারেট করার জন্য হেল্পার ফাংশন
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

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Global Configuration Center</h2>}
        >
            <Head title="System Settings" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <FiSettings className="text-indigo-500 h-4 w-4" /> Branding & System Configurations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Application Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Application Name</label>
                            <input
                                type="text"
                                value={data.app_name}
                                onChange={e => setData('app_name', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-slate-200 font-medium transition-all"
                            />
                            {errors.app_name && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.app_name}</div>}
                        </div>

                        {/* Helpline Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <FiPhone className="text-slate-400" /> Helpline / Contact Number
                            </label>
                            <input
                                type="text"
                                value={data.helpline}
                                onChange={e => setData('helpline', e.target.value)}
                                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-slate-200 font-medium transition-all"
                                placeholder="e.g., +880 123456789"
                            />
                            {errors.helpline && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.helpline}</div>}
                        </div>

                        {/* Company Address Textarea */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <FiMapPin className="text-slate-400" /> Company Address
                            </label>
                            <textarea
                                value={data.company_address}
                                onChange={e => setData('company_address', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-slate-200 font-medium transition-all resize-none"
                                placeholder="Enter company full physical address..."
                            />
                            {errors.company_address && <div className="text-rose-500 text-xs mt-1 font-medium">{errors.company_address}</div>}
                        </div>

                        {/* 1. System Main Logo */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                            <label className="block text-sm font-bold text-slate-500 mb-2">System Main Logo</label>
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                {getPreviewUrl(data.logo, settings.logo_url) ? (
                                    <img src={getPreviewUrl(data.logo, settings.logo_url)} alt="Logo Preview" className="h-12 w-auto object-contain border border-indigo-500/30 p-1 rounded-lg bg-white" />
                                ) : (
                                    <span className="text-xs text-slate-400">No logo uploaded</span>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                                <FiUploadCloud className="h-4 w-4" /> Choose Logo
                                <input type="file" onChange={e => setData('logo', e.target.files[0])} className="hidden" accept="image/*" />
                            </label>
                            {data.logo && <span className="text-xs text-emerald-500 mt-2 font-medium truncate max-w-xs">Selected: {data.logo.name}</span>}
                            {errors.logo && <div className="text-rose-500 text-xs mt-1">{errors.logo}</div>}
                        </div>

                        {/* 2. Browser Favicon */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                            <label className="block text-sm font-bold text-slate-500 mb-2">Browser Favicon</label>
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                {getPreviewUrl(data.favicon, settings.favicon_url) ? (
                                    <img src={getPreviewUrl(data.favicon, settings.favicon_url)} alt="Favicon Preview" className="h-8 w-8 object-contain border border-indigo-500/30 p-1 rounded-lg bg-white" />
                                ) : (
                                    <span className="text-xs text-slate-400">No favicon uploaded</span>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                                <FiUploadCloud className="h-4 w-4" /> Choose Favicon
                                <input type="file" onChange={e => setData('favicon', e.target.files[0])} className="hidden" accept="image/*" />
                            </label>
                            {data.favicon && <span className="text-xs text-emerald-500 mt-2 font-medium truncate max-w-xs">Selected: {data.favicon.name}</span>}
                            {errors.favicon && <div className="text-rose-500 text-xs mt-1">{errors.favicon}</div>}
                        </div>

                        {/* 3. Login Image Upload */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                            <label className="block text-sm font-bold text-slate-500 mb-2">Login Page Banner Image</label>
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                {getPreviewUrl(data.login_image, settings.login_image_url) ? (
                                    <img src={getPreviewUrl(data.login_image, settings.login_image_url)} alt="Login Banner Preview" className="h-14 w-auto object-contain border border-indigo-500/30 p-1 rounded-lg bg-white" />
                                ) : (
                                    <span className="text-xs text-slate-400">No login banner uploaded</span>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                                <FiUploadCloud className="h-4 w-4" /> Choose Login Image
                                <input type="file" onChange={e => setData('login_image', e.target.files[0])} className="hidden" accept="image/*" />
                            </label>
                            {data.login_image && <span className="text-xs text-emerald-500 mt-2 font-medium truncate max-w-xs">Selected: {data.login_image.name}</span>}
                            {errors.login_image && <div className="text-rose-500 text-xs mt-1">{errors.login_image}</div>}
                        </div>

                        {/* 4. Report Image Upload */}
                        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                            <label className="block text-sm font-bold text-slate-500 mb-2">Report Header Banner / Watermark</label>
                            <div className="h-16 w-full flex items-center justify-center mb-3">
                                {getPreviewUrl(data.report_image, settings.report_image_url) ? (
                                    <img src={getPreviewUrl(data.report_image, settings.report_image_url)} alt="Report Banner Preview" className="h-14 w-auto object-contain border border-indigo-500/30 p-1 rounded-lg bg-white" />
                                ) : (
                                    <span className="text-xs text-slate-400">No report image uploaded</span>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                                <FiUploadCloud className="h-4 w-4" /> Choose Report Image
                                <input type="file" onChange={e => setData('report_image', e.target.files[0])} className="hidden" accept="image/*" />
                            </label>
                            {data.report_image && <span className="text-xs text-emerald-500 mt-2 font-medium truncate max-w-xs">Selected: {data.report_image.name}</span>}
                            {errors.report_image && <div className="text-rose-500 text-xs mt-1">{errors.report_image}</div>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#394e5a] hover:bg-[#2c3e48] rounded-xl transition-all shadow-md focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            <FiSave className="h-4 w-4" />
                            {processing ? 'Saving Configurations...' : 'Apply & Save Settings'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}