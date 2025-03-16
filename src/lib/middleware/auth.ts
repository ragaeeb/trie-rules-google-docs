import { getSession } from '@/lib/session';
import { type NextRequest, NextResponse } from 'next/server';

declare module 'next/server' {
    interface NextRequest {
        accessToken: string;
    }
}

export function withAuth<T = any>(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse<T>>) {
    return (req: NextRequest, ...args: any[]) => {
        return (async () => {
            try {
                const { accessToken, isLoggedIn } = await getSession();

                if (!isLoggedIn || !accessToken) {
                    return NextResponse.json({ error: 'Unauthorized', sessionExpired: true }, { status: 401 });
                }

                req.accessToken = accessToken;

                // Pass all arguments to the handler
                return handler(req, ...args);
            } catch (error) {
                console.error('Auth middleware error:', error);
                return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
            }
        })();
    };
}
