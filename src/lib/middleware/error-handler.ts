import { NextRequest, NextResponse } from 'next/server';

import { clearSession } from '../session';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

const BUSTED_AUTH_MESSAGES = ['Invalid Credentials', 'invalid_grant', 'expired', 'invalid_token'];

/**
 * Wraps a route handler with centralized error handling.
 *
 * This middleware executes the provided route handler and intercepts any exceptions it throws. If the error message
 * contains common authentication error indicators, it logs the error, clears the user session, and returns a JSON
 * response indicating that the session has expired (HTTP status 401). For all other errors, it logs the error and returns
 * a generic JSON error response (HTTP status 500).
 *
 * @param handler - The route handler function to wrap.
 * @returns A new route handler function with integrated error handling.
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
    return async (req: NextRequest, ...args) => {
        try {
            // Pass all arguments to the handler
            return handler(req, ...args);
        } catch (error) {
            if (error instanceof Error && BUSTED_AUTH_MESSAGES.some((message) => error.message.includes(message))) {
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
