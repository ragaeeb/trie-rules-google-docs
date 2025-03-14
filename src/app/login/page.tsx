import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    const session = await getSession();

    if (session.isLoggedIn) {
        redirect('/dashboard');
    }

    const errorMessage = searchParams.error ? getErrorMessage(searchParams.error) : null;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-500">Sign In</h1>
                    <p className="mt-2 text-gray-600">Continue to Google Docs Formatter</p>
                </div>

                {errorMessage && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{errorMessage}</div>
                )}

                <div className="flex flex-col items-center justify-center space-y-4">
                    <GoogleAuthButton />

                    <div className="text-sm text-gray-600 mt-8 text-center">
                        By signing in, you agree to our
                        <Link className="text-blue-600 hover:underline ml-1" href="#">
                            Terms of Service
                        </Link>
                        {' and '}
                        <Link className="text-blue-600 hover:underline" href="#">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        auth_failed: 'Authentication failed. Please try again.',
        default: 'An error occurred. Please try again.',
        no_code: 'No authentication code received. Please try again.',
        no_token: 'Unable to obtain access token. Please try again.',
    };

    return errorMessages[errorCode] || errorMessages.default;
}
