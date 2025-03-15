'use client';

import Link from 'next/link';

export const LogoutButton = () => {
    return (
        <Link
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            href="/api/auth/logout"
            onClick={() => console.log('Logout link clicked')}
            prefetch={false}
        >
            Sign Out
        </Link>
    );
};
