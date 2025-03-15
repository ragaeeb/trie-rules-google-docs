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
            <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm" type="submit">
                Sign Out
            </button>
        </form>
    );
};
