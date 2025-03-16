'use client';

import { useRouter } from 'next/navigation';

export const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Logout button clicked');

        try {
            const response = await fetch('/api/auth/logout', {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });

            if (response.ok) {
                router.push('/login');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <form onSubmit={handleLogout}>
            <button className="text-zinc-700 hover:text-zinc-200 backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent rounded-md py-2 px-6 shadow hover:shadow-zinc-400 duration-700">
                Sign out
            </button>
        </form>
    );
};
