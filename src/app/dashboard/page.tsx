import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

import { DashboardHeader } from './DashboardHeader';
import { DocumentsSection } from './DocumentsSection';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect('/login');
    }

    const userInfo = session.userInfo;

    return (
        <main className="flex flex-col min-h-screen p-6 bg-white dark:bg-gray-900 text-content dark:text-content-dark transition-colors duration-300">
            <DashboardHeader userInfo={userInfo} />

            <div className="flex-1 max-w-6xl mx-auto w-full animate-fade-in">
                <DocumentsSection />
            </div>
        </main>
    );
}
