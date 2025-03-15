import { clearSession } from '@/lib/session';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log('Logout endpoint called');
        console.log('Request headers:', JSON.stringify(headers()));
        console.log('Request referrer:', request.headers.get('referer'));

        await clearSession();
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
    }
}
