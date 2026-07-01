import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* TWO-COLUMN GRID: Profile Info (Left) & Password Info (Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        
                        {/* LEFT SIDE: Profile Form Container */}
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800 w-full h-full">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="w-full"
                            />
                        </div>

                        {/* RIGHT SIDE: Password Form Container */}
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800 w-full h-full">
                            <UpdatePasswordForm className="w-full" />
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}