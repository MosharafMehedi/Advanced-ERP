import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    
    // Core states alignment maps initialization
    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '', // Check tracking property mappings string bounds
            photo: null,
        });

    // Fix context lookups paths tracking logic bindings
    const [imagePreview, setImagePreview] = useState(user.photo || null);
    const isDark = document.documentElement.classList.contains("dark");

    // Runtime initial dynamic check trigger properties matching if component targets reset
    useEffect(() => {
        if (user.photo) {
            setImagePreview(user.photo);
        }
    }, [user.photo]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        // Dynamic file upload properties multi-part stream payload updates overrides handling directly
        post(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: "Profile Updated!",
                    text: "Your records have been synchronized successfully.",
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                    background: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                });
            }
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Update your account's profile credentials, phone contact number, and avatar.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-4" encType="multipart/form-data">
                
                {/* Profile Image Processing & Preview Render Unit */}
                <div className="flex items-center gap-4 p-3 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-sm">
                    <div className="relative shrink-0">
                        {imagePreview ? (
                            <img 
                                src={imagePreview} 
                                alt={data.name} 
                                className="h-14 w-14 rounded-sm object-cover border border-gray-200 dark:border-gray-600 shadow-xs" 
                                onError={(e) => {
                                    // Fallback link path safety check trigger if paths broken
                                    e.target.onerror = null; 
                                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.name);
                                }}
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-gray-200 dark:bg-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                                {data.name ? data.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        >
                            <FiCamera className="text-gray-400" /> Choose Photo
                        </button>
                        <InputError className="mt-1" message={errors.photo} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-xs font-semibold" />
                    <TextInput id="name" className="mt-1 block w-full text-sm rounded-sm" value={data.name} onChange={(e) => setData('name', e.target.value)} required isFocused autoComplete="name" />
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-xs font-semibold" />
                    <TextInput id="email" type="email" className="mt-1 block w-full text-sm rounded-sm" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="username" />
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {/* Fixed Active Phone Number Input Binding Track */}
                <div>
                    <InputLabel htmlFor="phone" value="Mobile Number" className="text-xs font-semibold" />
                    <TextInput 
                        id="phone" 
                        type="text" 
                        placeholder="+8801XXXXXXXXX" 
                        className="mt-1 block w-full text-sm rounded-sm" 
                        value={data.phone} 
                        onChange={(e) => setData('phone', e.target.value)} // Confirm dynamic tracking bindings mapping direct
                        autoComplete="tel" 
                    />
                    <InputError className="mt-1" message={errors.phone} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-sm">
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            Your email address is unverified.
                            <Link href={route('verification.send')} method="post" as="button" className="underline font-bold ml-1 hover:text-amber-950 dark:hover:text-amber-200">Re-send email.</Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-1 text-[11px] font-semibold text-emerald-600">Verification link sent!</div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <PrimaryButton disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs font-bold px-4 py-2 uppercase tracking-wider">Save Changes</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out duration-300" enterFrom="opacity-0 translate-y-1" leave="transition ease-in-out duration-150" leaveTo="opacity-0">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}