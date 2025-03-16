import { clearSession } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * Handles a POST request to log out a user.
 *
 * This asynchronous function clears the user session and redirects to the login page using the
 * base URL defined in the environment variable `NEXT_PUBLIC_BASE_URL`. If the session clearance fails,
 * the error is logged and a JSON response with an error message and a 500 status code is returned.
 */
export async function POST() {
    try {
        await clearSession();
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
    }
}
