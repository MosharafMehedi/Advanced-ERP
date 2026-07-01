import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import Swal from 'sweetalert2';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = 
        useForm({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const isDark = document.documentElement.classList.contains("dark");

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    title: "Security Updated!",
                    text: "Your account password has been changed successfully.",
                    icon: "success",
                    timer: 1800,
                    showConfirmButton: false,
                    background: isDark ? "#1f2937" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2937",
                });
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Update Password
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-4">
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" className="text-xs font-semibold" />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full text-sm rounded-sm"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-xs font-semibold" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full text-sm rounded-sm"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-xs font-semibold" />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full text-sm rounded-sm"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <PrimaryButton disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs font-bold px-4 py-2 uppercase tracking-wider">Save Password</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out duration-300" enterFrom="opacity-0 translate-y-1" leave="transition ease-in-out duration-150" leaveTo="opacity-0">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}