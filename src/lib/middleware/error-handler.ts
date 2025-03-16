import { NextRequest, NextResponse } from 'next/server';

import { clearSession } from '../session';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

const AUTH_ERROR_MESSAGES = ['Invalid Credentials', 'invalid_grant', 'expired', 'invalid_token'];

export function withErrorHandling(handler: RouteHandler): RouteHandler {
    return async (req: NextRequest, ...args) => {
        try {
            // Pass all arguments to the handler
            return handler(req, ...args);
        } catch (error) {
            if (error instanceof Error && AUTH_ERROR_MESSAGES.some((message) => error.message.includes(message))) {
                console.error('Google API authentication error:', error);

                await clearSession();

                return NextResponse.json(
                    { error: 'Session expired. Please log in again.', sessionExpired: true },
                    { status: 401 },
                );
            }

            console.error('Unhandled error in route handler:', error);
            return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
        }
    };
}
