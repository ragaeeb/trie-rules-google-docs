import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

type SessionData = {
    accessToken?: string;
    expiresAt?: number;
    isLoggedIn: boolean;
    refreshToken?: string;
    userInfo?: {
        email: string;
        id: string;
        name: string;
        picture: string;
    };
};

export const getSession = async () => {
    const session = await getIronSession<SessionData>(await cookies(), {
        cookieName: 'google-docs-formatter-session',
        cookieOptions: {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        },
        password: process.env.SESSION_SECRET as string,
    });

    return { ...session, isLoggedIn: false };
};

export const saveSession = async (session: SessionData) => {
    const currentSession = await getSession();

    Object.assign(currentSession, session);
    await currentSession.save();

    return currentSession;
};

export const clearSession = async () => {
    const session = await getSession();
    session.isLoggedIn = false;
    session.accessToken = undefined;
    session.refreshToken = undefined;
    session.userInfo = undefined;
    await session.save();
};
