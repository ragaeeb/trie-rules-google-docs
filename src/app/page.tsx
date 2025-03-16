import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Renders the home page for unauthenticated users and redirects authenticated users.
 *
 * This asynchronous component retrieves the current user session. If the session indicates that the user is logged in, it performs a redirect to the dashboard ("/dashboard"). Otherwise, it returns a JSX element displaying a title, a service description, and a call-to-action button linking to the login page ("/login").
 *
 * @returns A JSX element representing the home page for users who are not logged in.
 */
export default async function Home() {
    const session = await getSession();

    if (session.isLoggedIn) {
        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 space-y-6">
            <h1 className="text-4xl font-bold text-center">Google Docs Formatter</h1>

            <p className="text-xl text-center max-w-md">
                A secure way to format your Google Docs. Login with your Google account to get started.
            </p>

            <div className="mt-8">
                <div className="relative group">
                    <Link
                        className="relative inline-block p-px font-semibold leading-6 text-white bg-neutral-900 shadow-2xl cursor-pointer rounded-2xl shadow-emerald-900 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:shadow-emerald-600"
                        href="/login"
                    >
                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-600 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative z-10 block px-6 py-3 rounded-2xl bg-neutral-950">
                            <div className="relative z-10 flex items-center space-x-3">
                                <span className="transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-emerald-300">
                                    Get Started
                                </span>
                                <svg
                                    className="w-7 h-7 transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-emerald-300"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
                                </svg>
                            </div>
                        </span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
