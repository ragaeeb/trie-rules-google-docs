import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type SessionData = {
  accessToken?: string;
  userInfo?: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  isLoggedIn: boolean;
};

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "google-docs-formatter-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
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
  session.userInfo = undefined;
  await session.save();
};

// Get access token from session
export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session.accessToken || null;
};

// Check if user is logged in
export const isUserLoggedIn = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session.isLoggedIn;
};