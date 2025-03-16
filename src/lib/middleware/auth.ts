import { getSession } from '@/lib/session';
import { type NextRequest, NextResponse } from 'next/server';

declare module 'next/server' {
    interface NextRequest {
        accessToken: string;
    }
}

/**
 * Wraps an API handler with authentication logic.
 *
 * Retrieves the user's session via `getSession` and verifies that a valid access token exists and the user is logged in.
 * If authentication fails, it returns a JSON response with a 401 status indicating that the session has expired.
 * When successfully authenticated, the middleware attaches the access token to the request and delegates processing to the provided handler.
 * In case of an error during session retrieval, it logs the error and responds with a 500 JSON error.
 *
 * @param handler - The API handler to invoke if authentication succeeds.
 * @returns A wrapped handler function that enforces authentication before calling the original handler.
 */
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
