import { FullDocument } from '@/types/document';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export const createOAuth2Client = () => {
    return new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
    });
};

export const generateAuthUrl = (client: OAuth2Client) => {
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
    });
};

export const getTokensFromCode = async (client: OAuth2Client, code: string) => {
    return await client.getToken(code);
};

export const fetchUserInfo = async (accessToken: string) => {
    const client = createOAuth2Client();
    client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({ auth: client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    return userInfo.data;
};

export const listDocuments = async (accessToken: string): Promise<Document[]> => {
    const client = createOAuth2Client();
    client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ auth: client, version: 'v3' });

    const response = await drive.files.list({
        fields: 'files(id, name)',
        q: "mimeType='application/vnd.google-apps.document'",
    });

    return (response.data.files as Document[]) || [];
};

export const getDocument = async (accessToken: string, documentId: string): Promise<FullDocument> => {
    const client = createOAuth2Client();
    client.setCredentials({ access_token: accessToken });

    const docs = google.docs({ auth: client, version: 'v1' });

    const response = await docs.documents.get({
        documentId,
    });

    return response.data as FullDocument;
};

export const formatDocument = async (
    accessToken: string,
    documentId: string,
    formatType: 'bold' | 'color' | 'font',
) => {
    const client = createOAuth2Client();
    client.setCredentials({ access_token: accessToken });

    const docs = google.docs({ auth: client, version: 'v1' });

    // First get the document to determine content ranges
    const document = await docs.documents.get({
        documentId,
    });

    // Find the end index of the content
    const endIndex = document.data.body?.content?.[0]?.endIndex || 1;

    let requests: any[] = [];

    switch (formatType) {
        case 'bold':
            requests = [
                {
                    updateTextStyle: {
                        fields: 'bold',
                        range: {
                            endIndex: endIndex - 1,
                            startIndex: 1,
                        },
                        textStyle: {
                            bold: true,
                        },
                    },
                },
            ];
            break;

        case 'color':
            requests = [
                {
                    updateTextStyle: {
                        fields: 'foregroundColor',
                        range: {
                            endIndex: endIndex - 1,
                            startIndex: 1,
                        },
                        textStyle: {
                            foregroundColor: {
                                color: {
                                    rgbColor: {
                                        blue: 1.0,
                                        green: 0.0,
                                        red: 0.0,
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            break;

        case 'font':
            requests = [
                {
                    updateTextStyle: {
                        fields: 'weightedFontFamily',
                        range: {
                            endIndex: endIndex - 1,
                            startIndex: 1,
                        },
                        textStyle: {
                            weightedFontFamily: {
                                fontFamily: 'Arial',
                            },
                        },
                    },
                },
            ];
            break;
    }

    return await docs.documents.batchUpdate({
        documentId,
        requestBody: {
            requests,
        },
    });
};
