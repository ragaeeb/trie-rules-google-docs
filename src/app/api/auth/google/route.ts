import { createOAuth2Client, generateAuthUrl } from '@/lib/google-client';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = createOAuth2Client();
        const authUrl = generateAuthUrl(client);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error initiating Google auth:', error);
        return NextResponse.json({ error: 'Failed to initiate authentication' }, { status: 500 });
    }
}
