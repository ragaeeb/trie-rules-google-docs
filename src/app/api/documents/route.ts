import { listDocuments } from '@/lib/google-client';
import { clearSession, getAccessToken, isUserLoggedIn } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const loggedIn = await isUserLoggedIn();

        if (!loggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await getAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token available' }, { status: 401 });
        }

        try {
            const documents = await listDocuments(accessToken);
            return NextResponse.json({ documents });
        } catch (error) {
            // Check if it's an invalid credentials error
            if (
                error instanceof Error &&
                (error.message.includes('Invalid Credentials') ||
                    error.message.includes('invalid_grant') ||
                    error.message.includes('token expired') ||
                    error.message.includes('invalid_token'))
            ) {
                console.error('Google API authentication error:', error);

                // Clear the session due to invalid credentials
                await clearSession();

                // Return session expired error
                return NextResponse.json(
                    { error: 'Session expired. Please log in again.', sessionExpired: true },
                    { status: 401 },
                );
            }

            // Re-throw for other errors
            throw error;
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}
