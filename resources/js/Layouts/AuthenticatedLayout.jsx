import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import Sidebar from '@/Components/Sidebar'; // 👈 সাইডবার ইম্পোর্ট
import Header from '@/Components/Header';   // 👈 হেডার ইম্পোর্ট

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingSidebar, setShowingSidebar] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex">
            
            {/* ১. আলাদা করা সাইডবার কম্পোনেন্ট */}
            <Sidebar 
                showingSidebar={showingSidebar} 
                setShowingSidebar={setShowingSidebar} 
            />

            {/* ডানপাশের মেইন কন্টেন্ট এরিয়া */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
                
                {/* ২. আলাদা করা হেডার কম্পোনেন্ট */}
                <Header 
                    user={user} 
                    showingSidebar={showingSidebar} 
                    setShowingSidebar={setShowingSidebar} 
                />

                {/* ডায়নামিক সাব-হেডার (যদি কন্ট্রোলার থেকে পাঠানো হয়) */}
                {header && (
                    <div className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </div>
                )}

                {/* ৩. মূল কন্টেন্ট রেন্ডার এরিয়া */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}