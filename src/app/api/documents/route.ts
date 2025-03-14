import { listDocuments } from '@/lib/google-client';
import { getAccessToken, isUserLoggedIn } from '@/lib/session';
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

        const documents = await listDocuments(accessToken);

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}
