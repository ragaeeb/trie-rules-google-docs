import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

import { DashboardHeader } from './DashboardHeader';
import { DocumentsSection } from './DocumentsSection';

/**
 * Renders the dashboard page.
 *
 * This asynchronous component retrieves the current session to determine if the user is logged in.
 * If the session indicates the user is not authenticated, it redirects to the login page.
 * When authenticated, it extracts the user's information and renders the dashboard layout,
 * which includes the DashboardHeader (fed with the user information) and the DocumentsSection.
 */
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
