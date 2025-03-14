import { DocumentsList } from '@/components/DocumentsList';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect('/login');
    }

    const userInfo = session.userInfo;

    return (
        <main className="flex flex-col min-h-screen p-6">
            <header className="flex justify-between items-center mb-8 pb-4 border-b">
                <h1 className="text-2xl font-bold">Google Docs Formatter</h1>

                {userInfo && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img alt={userInfo.name} className="w-8 h-8 rounded-full" src={userInfo.picture} />
                            <span>{userInfo.name}</span>
                        </div>
                        <Link
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                            href="/api/auth/logout"
                        >
                            Sign Out
                        </Link>
                    </div>
                )}
            </header>

            <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
                <DocumentsList />
            </div>
        </main>
    );
}
