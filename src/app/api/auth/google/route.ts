import { createOAuth2Client, generateAuthUrl } from '@/lib/google-client';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return new Response(null, {
            headers: {
                Location: generateAuthUrl(createOAuth2Client()),
            },
            status: 302,
        });
    } catch (error) {
        console.error('Error initiating Google auth:', error);
        return NextResponse.json({ error: 'Failed to initiate authentication' }, { status: 500 });
    }
}
