import { clearSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await clearSession();
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
    }
}
