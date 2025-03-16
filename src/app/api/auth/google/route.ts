import { createOAuth2Client, generateAuthUrl } from '@/lib/google-client';
import { NextResponse } from 'next/server';

/**
 * Handles a GET request to initiate Google authentication.
 *
 * This function creates an OAuth2 client, generates an authentication URL, and returns
 * a redirect response (HTTP 302) to the generated URL. If an error occurs during the process,
 * it logs the error and returns a JSON response with a 500 status code.
 */
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
