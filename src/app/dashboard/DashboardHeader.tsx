import { LogoutButton } from '@/components/LogoutButton';
import Image from 'next/image';

type DashboardHeaderProps = {
    userInfo?: UserInfo;
};

type UserInfo = {
    email?: string;
    name: string;
    picture: string;
};

export function DashboardHeader({ userInfo }: DashboardHeaderProps) {
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b dark:border-gray-700 max-w-6xl mx-auto w-full animate-fade-in">
            <div className="flex items-center mb-4 sm:mb-0">
                <div className="flex items-center text-primary dark:text-primary-dark mr-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 transition-colors">
                    Google Docs Formatter
                </h1>
            </div>

            {userInfo && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-secondary dark:bg-secondary-dark rounded-full pl-2 pr-4 py-1 shadow-sm transition-all duration-200 hover:shadow transform hover:scale-[1.02]">
                        <div className="overflow-hidden rounded-full border-2 border-white dark:border-gray-700 shadow-sm">
                            <Image
                                alt={userInfo.name}
                                className="w-8 h-8 rounded-full"
                                height={100}
                                src={userInfo.picture}
                                width={100}
                            />
                        </div>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{userInfo.name}</span>
                    </div>
                    <LogoutButton />
                </div>
            )}
        </header>
    );
}
