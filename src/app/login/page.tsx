import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Renders the login page and manages authentication flow.
 *
 * This asynchronous component awaits search parameters to detect a potential error code,
 * retrieves the user's session status, and conditionally redirects authenticated users
 * to the dashboard. If an error code is provided, it displays a corresponding user-friendly
 * error message above the login form, which includes a Google authentication button and
 * links to the Terms of Service and Privacy Policy.
 *
 * @param props - An object containing a promise that resolves to search parameters, including an optional error code.
 * @returns A JSX element representing the login page.
 */
export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();

    if (session.isLoggedIn) {
        redirect('/dashboard');
    }

    const errorMessage = searchParams.error ? getErrorMessage(searchParams.error) : null;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg">
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

/**
 * Returns a user-friendly error message based on an authentication error code.
 *
 * @param errorCode - The error code representing a specific authentication issue.
 * @returns The corresponding error message if the error code is recognized; otherwise, a default error message.
 */
function getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        auth_failed: 'Authentication failed. Please try again.',
        default: 'An error occurred. Please try again.',
        no_code: 'No authentication code received. Please try again.',
        no_token: 'Unable to obtain access token. Please try again.',
        session_expired: 'Your session has expired. Please sign in again.',
    };

    return errorMessages[errorCode] || errorMessages.default;
}
