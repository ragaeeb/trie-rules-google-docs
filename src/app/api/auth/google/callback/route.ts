import { createOAuth2Client, fetchUserInfo } from '@/lib/google-client';
import { saveSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles the OAuth2 callback for Google authentication.
 *
 * This asynchronous function processes the authentication callback by extracting the authorization code
 * from the request's URL. It exchanges the code for access tokens via an OAuth2 client, then fetches the user's
 * information using the retrieved token. On success, it saves session data (in memory) including user details and
 * token expiry, and redirects the user to the dashboard. If the code is missing, the token is unavailable, or any
 * error is encountered, it logs the error and redirects the user to the login page with an appropriate error message.
 *
 * @returns A redirect response to the dashboard on successful authentication, or to the login page on failure.
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`);
        }

        // Exchange code for tokens
        const client = createOAuth2Client();
        const { tokens } = await client.getToken(code);

        if (!tokens.access_token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_token`);
        }

        const userInfo = await fetchUserInfo(tokens.access_token);

        // Save to session (memory only, not persisted to database)
        await saveSession({
            accessToken: tokens.access_token,
            expiresAt: Date.now() + (tokens.expiry_date || 3600 * 1000), // Add expiry tracking
            isLoggedIn: true,
            userInfo: {
                email: userInfo.email as string,
                id: userInfo.id as string,
                name: userInfo.name as string,
                picture: userInfo.picture as string,
            },
        });

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    } catch (error) {
        console.error('Error during callback:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=auth_failed`);
    }
}
