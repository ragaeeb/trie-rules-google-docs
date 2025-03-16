import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
    accessToken?: string;
    expiresAt?: number;
    isLoggedIn: boolean;
    refreshToken?: string; // Added refresh token
    userInfo?: {
        email: string;
        id: string;
        name: string;
        picture: string;
    };
};

const sessionOptions = {
    cookieName: 'google-docs-formatter-session',
    cookieOptions: {
        httpOnly: true,
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
    },
    password: process.env.SESSION_SECRET as string,
};

// Helper to get the session on the server side
export const getSession = async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    // Initialize empty session if needed
    if (!session.isLoggedIn) {
        session.isLoggedIn = false;
    }

    return session;
};

// Helper to save session data
export const saveSession = async (session: SessionData) => {
    const currentSession = await getSession();

    Object.assign(currentSession, session);
    await currentSession.save();

    return currentSession;
};

// Helper to clear session
export const clearSession = async () => {
    const session = await getSession();
    session.isLoggedIn = false;
    session.accessToken = undefined;
    session.refreshToken = undefined;
    session.userInfo = undefined;
    await session.save();
};
