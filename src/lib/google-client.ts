import { FullDocument } from '@/types/document';
import { Change } from '@/types/formatting';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { mapChangeToGoogleDocReplaceRequest } from './diff';
import { clearSession, getSession, saveSession } from './session';

// Buffer time (in ms) before token expiry to refresh - 30 seconds
const TOKEN_EXPIRY_BUFFER = 30 * 1000;

export const createOAuth2Client = ({
    accessToken,
    refreshToken,
}: { accessToken?: string; refreshToken?: string } = {}) => {
    const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
    });
    client.setCredentials({
        ...(accessToken && { access_token: accessToken }),
        ...(refreshToken && { refresh_token: refreshToken }),
    });

    return client;
};

export const generateAuthUrl = (client: OAuth2Client) => {
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
        ],
    });
};

export const getValidAccessToken = async (): Promise<null | string> => {
    const session = await getSession();

    // If no token or not logged in, return null
    if (!session.isLoggedIn || !session.accessToken) {
        return null;
    }

    // If token is still valid (with buffer time)
    if (session.expiresAt && session.expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER) {
        return session.accessToken;
    }

    // Token is expired or close to expiry, but we have a refresh token
    if (session.refreshToken) {
        try {
            console.log('Access token expired, attempting to refresh');
            const client = createOAuth2Client({ refreshToken: session.refreshToken });

            // This will use the refresh token to get a new access token
            const { credentials } = await client.refreshAccessToken();

            // Update session with new tokens
            await saveSession({
                ...session,
                accessToken: credentials.access_token || undefined,
                expiresAt: Date.now() + (credentials.expiry_date ? credentials.expiry_date - Date.now() : 3600 * 1000), // Default to 1 hour if no expiry provided
            });

            console.log('Successfully refreshed access token');
            return credentials.access_token || null;
        } catch (error) {
            // If refresh fails, clear session and force re-auth
            console.error('Failed to refresh token:', error);
            await clearSession();
            return null;
        }
    }

    // No refresh token available
    console.warn('Token expired and no refresh token available');
    await clearSession();
    return null;
};

export const fetchUserInfo = async (accessToken: string) => {
    const oauth2 = google.oauth2({ auth: createOAuth2Client({ accessToken }), version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    return userInfo.data;
};

export const listDocuments = async (accessToken: string): Promise<Document[]> => {
    const drive = google.drive({ auth: createOAuth2Client({ accessToken }), version: 'v3' });

    const response = await drive.files.list({
        fields: 'files(id, name)',
        q: "mimeType='application/vnd.google-apps.document'",
    });

    return (response.data.files as Document[]) || [];
};

export const getDocument = async (accessToken: string, documentId: string): Promise<FullDocument> => {
    const response = await getDocsApi(accessToken).documents.get({
        documentId,
    });

    return response.data as FullDocument;
};

const getDocsApi = (accessToken: string) => {
    return google.docs({ auth: createOAuth2Client({ accessToken }), version: 'v1' });
};

export const applyChangesToDoc = async (id: string, changes: Change[], { accessToken }: { accessToken: string }) => {
    const requests = changes.map(mapChangeToGoogleDocReplaceRequest);

    return getDocsApi(accessToken).documents.batchUpdate({
        documentId: id,
        requestBody: { requests },
    });
};
