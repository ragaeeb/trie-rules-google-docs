import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOAuth2Client, generateAuthUrl, getDocument, getValidAccessToken } from './google-client';
import { clearSession, getSession, saveSession } from './session';

const mockSetCredentials = vi.fn();

vi.mock('google-auth-library', () => {
    return {
        OAuth2Client: vi.fn(() => ({
            generateAuthUrl: vi.fn().mockReturnValue('https://mock-auth-url.com'),
            refreshAccessToken: vi.fn().mockResolvedValue({
                credentials: {
                    access_token: 'new-access-token',
                    expiry_date: Date.now() + 3600 * 1000,
                },
            }),
            setCredentials: mockSetCredentials,
        })),
    };
});

vi.mock('./diff', () => ({
    mapChangeToGoogleDocReplaceRequest: vi.fn((change) => ({
        replaceAllText: {
            containsText: {
                matchCase: !change.caseInsensitive,
                text: change.from,
            },
            replaceText: change.to,
        },
    })),
}));

vi.mock('./session', () => ({
    clearSession: vi.fn(),
    getSession: vi.fn(),
    saveSession: vi.fn(),
}));

const mockUserinfoGet = vi.fn().mockResolvedValue({
    data: {
        email: 'user@example.com',
        id: 'user-id',
        name: 'Test User',
        picture: 'https://example.com/profile.jpg',
    },
});

const mockFilesList = vi.fn().mockResolvedValue({
    data: {
        files: [
            { id: 'doc1', name: 'Document 1' },
            { id: 'doc2', name: 'Document 2' },
        ],
    },
});

const mockDocsGet = vi.fn().mockResolvedValue({
    data: { content: 'Test content', title: 'Test Document' },
});

const mockBatchUpdate = vi.fn().mockResolvedValue({ data: { replies: [] } });

vi.mock('googleapis', () => {
    return {
        google: {
            docs: vi.fn(() => ({
                documents: {
                    batchUpdate: mockBatchUpdate,
                    get: mockDocsGet,
                },
            })),
            drive: vi.fn(() => ({
                files: {
                    list: mockFilesList,
                },
            })),
            oauth2: vi.fn(() => ({
                userinfo: {
                    get: mockUserinfoGet,
                },
            })),
        },
    };
});

describe('Google Client Module', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        vi.stubGlobal('console', {
            ...console,
            error: vi.fn(),
            log: vi.fn(),
            warn: vi.fn(),
        });

        vi.stubEnv('GOOGLE_CLIENT_ID', 'mock-client-id');
        vi.stubEnv('GOOGLE_CLIENT_SECRET', 'mock-client-secret');
        vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');

        (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            accessToken: 'valid-access-token',
            expiresAt: Date.now() + 3600 * 1000,
            isLoggedIn: true,
            refreshToken: 'valid-refresh-token',
            save: vi.fn().mockResolvedValue(undefined),
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    describe('createOAuth2Client', () => {
        beforeEach(() => {
            mockSetCredentials.mockClear();
        });

        it('should create a client with the correct configuration', () => {
            createOAuth2Client();

            expect(OAuth2Client).toHaveBeenCalledWith({
                clientId: 'mock-client-id',
                clientSecret: 'mock-client-secret',
                redirectUri: 'https://example.com/api/auth/google/callback',
            });
        });

        it('should set credentials when tokens are provided', () => {
            createOAuth2Client({
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
            });

            expect(mockSetCredentials).toHaveBeenCalledWith({
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
            });
        });

        it('should not include undefined tokens in credentials', () => {
            createOAuth2Client({
                accessToken: 'test-access-token',
            });

            expect(mockSetCredentials).toHaveBeenCalledWith({
                access_token: 'test-access-token',
            });
        });
    });

    describe('generateAuthUrl', () => {
        it('should call generateAuthUrl with correct parameters', () => {
            // Create client object with the generateAuthUrl method that we can spy on
            const mockClient = {
                generateAuthUrl: vi.fn().mockReturnValue('https://mock-auth-url.com'),
            };

            generateAuthUrl(mockClient as unknown as OAuth2Client);

            expect(mockClient.generateAuthUrl).toHaveBeenCalledWith({
                access_type: 'offline',
                prompt: 'consent',
                scope: [
                    'https://www.googleapis.com/auth/documents',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/drive.metadata.readonly',
                ],
            });
        });

        it('should return the url from generateAuthUrl', () => {
            // Create client object with the generateAuthUrl method
            const mockClient = {
                generateAuthUrl: vi.fn().mockReturnValue('https://mock-auth-url.com'),
            };

            const url = generateAuthUrl(mockClient as unknown as OAuth2Client);

            expect(url).toBe('https://mock-auth-url.com');
        });
    });

    describe('getValidAccessToken', () => {
        it('should return null when not logged in', async () => {
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                isLoggedIn: false,
            });

            const token = await getValidAccessToken();

            expect(token).toBeNull();
        });

        it('should return null when no access token is available', async () => {
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                accessToken: undefined,
                isLoggedIn: true,
            });

            const token = await getValidAccessToken();

            expect(token).toBeNull();
        });

        it('should return the current token if it is not expired', async () => {
            const validToken = 'valid-access-token';
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                accessToken: validToken,
                expiresAt: Date.now() + 60 * 1000, // 60 seconds in the future (more than buffer)
                isLoggedIn: true,
            });

            const token = await getValidAccessToken();

            expect(token).toBe(validToken);
        });

        it('should refresh token if it is close to expiry', async () => {
            const mockRefreshClient = {
                refreshAccessToken: vi.fn().mockResolvedValue({
                    credentials: {
                        access_token: 'new-access-token',
                        expiry_date: Date.now() + 3600 * 1000,
                    },
                }),
                setCredentials: vi.fn(),
            };

            (OAuth2Client as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockRefreshClient);

            const expiringToken = 'expiring-access-token';
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                accessToken: expiringToken,
                expiresAt: Date.now() + 10 * 1000, // 10 seconds (less than buffer)
                isLoggedIn: true,
                refreshToken: 'valid-refresh-token',
                save: vi.fn(),
            });

            const token = await getValidAccessToken();

            expect(mockRefreshClient.setCredentials).toHaveBeenCalledWith({
                refresh_token: 'valid-refresh-token',
            });
            expect(mockRefreshClient.refreshAccessToken).toHaveBeenCalled();
            expect(token).toBe('new-access-token');
            expect(saveSession).toHaveBeenCalled();
        });

        it('should clear session and return null if refresh fails', async () => {
            const mockFailingClient = {
                refreshAccessToken: vi.fn().mockRejectedValue(new Error('Refresh failed')),
                setCredentials: vi.fn(),
            };

            (OAuth2Client as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFailingClient);

            const expiringToken = 'expiring-access-token';
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                accessToken: expiringToken,
                expiresAt: Date.now() + 10 * 1000, // 10 seconds (less than buffer)
                isLoggedIn: true,
                refreshToken: 'valid-refresh-token',
                save: vi.fn(),
            });

            const token = await getValidAccessToken();

            expect(mockFailingClient.setCredentials).toHaveBeenCalledWith({
                refresh_token: 'valid-refresh-token',
            });
            expect(token).toBeNull();
            expect(clearSession).toHaveBeenCalled();
        });

        it('should clear session and return null if token is expired and no refresh token', async () => {
            (getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                accessToken: 'expired-token',
                expiresAt: Date.now() - 1000, // Already expired
                isLoggedIn: true,
                refreshToken: undefined,
                save: vi.fn(),
            });

            const token = await getValidAccessToken();

            expect(token).toBeNull();
            expect(clearSession).toHaveBeenCalled();
        });
    });

    describe('getDocument', () => {
        it('should call docs API with correct parameters', async () => {
            mockDocsGet.mockImplementation(() => Promise.resolve({}));

            const accessToken = 'test-access-token';
            const documentId = 'test-doc-id';

            try {
                await getDocument(accessToken, documentId);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error: any) {
                // Ignore any errors from the function itself
            }

            expect(google.docs).toHaveBeenCalled();
            expect(mockDocsGet).toHaveBeenCalledWith({
                documentId,
            });
        });
    });
});
