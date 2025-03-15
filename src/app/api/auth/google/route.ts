import { createOAuth2Client, generateAuthUrl } from '@/lib/google-client';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('auth/google/route');
        const client = createOAuth2Client();
        const authUrl = generateAuthUrl(client);

        return new Response(null, {
            headers: {
                Location: authUrl,
            },
            status: 302,
        });
    } catch (error) {
        console.error('Error initiating Google auth:', error);
        return NextResponse.json({ error: 'Failed to initiate authentication' }, { status: 500 });
    }
}
