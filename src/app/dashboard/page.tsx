import { DocumentsList } from '@/components/DocumentsList';
import { LogoutButton } from '@/components/LogoutButton';
import { getSession } from '@/lib/session';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();
    console.log('session.isLoggedin', session.isLoggedIn);

    if (!session.isLoggedIn) {
        console.log('redirect to login');
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
                            <Image
                                alt={userInfo.name}
                                className="w-8 h-8 rounded-full"
                                height={100}
                                src={userInfo.picture}
                                width={100}
                            />
                            <span>{userInfo.name}</span>
                        </div>
                        <LogoutButton />
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
