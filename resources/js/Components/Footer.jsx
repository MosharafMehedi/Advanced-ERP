export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-sm text-slate-500 transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-700 dark:text-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p>© {currentYear} CoreERP. All rights reserved. Developed by MyMind.</p>
            </div>
        </footer>
    );
}