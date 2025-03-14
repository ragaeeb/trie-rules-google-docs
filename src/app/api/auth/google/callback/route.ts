import { createOAuth2Client, fetchUserInfo, getTokensFromCode } from '@/lib/google-client';
import { saveSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code`);
        }

        // Exchange code for tokens
        const client = createOAuth2Client();
        const { tokens } = await getTokensFromCode(client, code);

        if (!tokens.access_token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_token`);
        }

        // Get user info
        const userInfo = await fetchUserInfo(tokens.access_token);

        // Save to session (memory only, not persisted to database)
        await saveSession({
            accessToken: tokens.access_token,
            isLoggedIn: true,
            userInfo: {
                email: userInfo.email as string,
                id: userInfo.id as string,
                name: userInfo.name as string,
                picture: userInfo.picture as string,
            },
        });

        // Redirect to dashboard
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    } catch (error) {
        console.error('Error during callback:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=auth_failed`);
    }
}
