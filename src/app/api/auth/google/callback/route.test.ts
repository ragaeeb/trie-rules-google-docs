import * as googleClientModule from '@/lib/google-client';
import * as sessionModule from '@/lib/session';
import { NextRequest } from 'next/server';
import * as nextServer from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

vi.mock('@/lib/google-client', () => ({
    createOAuth2Client: vi.fn(),
    fetchUserInfo: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
    saveSession: vi.fn(),
}));

vi.mock('next/server', () => ({
    NextRequest: vi.fn(),
    NextResponse: {
        json: vi.fn(),
        redirect: vi.fn().mockImplementation((url) => ({
            url,
        })),
    },
}));

describe('route', () => {
    describe('GET', () => {
        let mockRequest: NextRequest;
        let mockOAuthClient: any;
        let consoleErrorSpy: any;
        const originalEnv = process.env;

        beforeEach(() => {
            mockOAuthClient = {
                getToken: vi.fn(),
            };

            vi.mocked(googleClientModule.createOAuth2Client).mockReturnValue(mockOAuthClient);
            vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');

            mockRequest = {
                nextUrl: {
                    searchParams: new URLSearchParams('code=test-code'),
                },
            } as unknown as NextRequest;

            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            vi.resetAllMocks();
            vi.unstubAllEnvs();
            consoleErrorSpy.mockRestore();
            process.env = originalEnv;
        });

        it('should redirect to login if code is missing', async () => {
            const requestWithoutCode = {
                nextUrl: {
                    searchParams: new URLSearchParams(''),
                },
            } as unknown as NextRequest;

            await GET(requestWithoutCode);

            expect(nextServer.NextResponse.redirect).toHaveBeenCalledWith('https://example.com/login?error=no_code');
        });

        it('should redirect to login if token exchange fails', async () => {
            mockOAuthClient.getToken.mockRejectedValue(new Error('Token exchange failed'));

            await GET(mockRequest);

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(nextServer.NextResponse.redirect).toHaveBeenCalledWith(
                'https://example.com/login?error=auth_failed',
            );
        });

        it('should redirect to login if access token is missing', async () => {
            mockOAuthClient.getToken.mockResolvedValue({ tokens: {} });

            await GET(mockRequest);

            expect(nextServer.NextResponse.redirect).toHaveBeenCalledWith('https://example.com/login?error=no_token');
        });

        it('should redirect to login if fetching user info fails', async () => {
            mockOAuthClient.getToken.mockResolvedValue({ tokens: { access_token: 'test-token' } });
            vi.mocked(googleClientModule.fetchUserInfo).mockRejectedValue(new Error('Failed to fetch user info'));

            await GET(mockRequest);

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(nextServer.NextResponse.redirect).toHaveBeenCalledWith(
                'https://example.com/login?error=auth_failed',
            );
        });

        it('should redirect to dashboard if authentication succeeds', async () => {
            const mockTokens = {
                access_token: 'test-access-token',
                expiry_date: Date.now() + 3600000,
            };

            const mockUserInfo = {
                email: 'user@example.com',
                id: 'user123',
                name: 'Test User',
                picture: 'https://example.com/profile.jpg',
            };

            mockOAuthClient.getToken.mockResolvedValue({ tokens: mockTokens });
            vi.mocked(googleClientModule.fetchUserInfo).mockResolvedValue(mockUserInfo);

            await GET(mockRequest);

            expect(googleClientModule.createOAuth2Client).toHaveBeenCalled();
            expect(mockOAuthClient.getToken).toHaveBeenCalledWith('test-code');
            expect(googleClientModule.fetchUserInfo).toHaveBeenCalledWith('test-access-token');

            expect(sessionModule.saveSession).toHaveBeenCalledWith({
                accessToken: 'test-access-token',
                expiresAt: expect.any(Number),
                isLoggedIn: true,
                userInfo: {
                    email: 'user@example.com',
                    id: 'user123',
                    name: 'Test User',
                    picture: 'https://example.com/profile.jpg',
                },
            });

            expect(nextServer.NextResponse.redirect).toHaveBeenCalledWith('https://example.com/dashboard');
        });

        it('should use default expiry when expiry_date is not provided', async () => {
            const mockTokens = {
                access_token: 'test-access-token',
                // No expiry_date provided
            };

            const mockUserInfo = {
                email: 'user@example.com',
                id: 'user123',
                name: 'Test User',
                picture: 'https://example.com/profile.jpg',
            };

            mockOAuthClient.getToken.mockResolvedValue({ tokens: mockTokens });
            vi.mocked(googleClientModule.fetchUserInfo).mockResolvedValue(mockUserInfo);

            const beforeTime = Date.now();
            await GET(mockRequest);
            const afterTime = Date.now();

            expect(sessionModule.saveSession).toHaveBeenCalled();
            const sessionArg = vi.mocked(sessionModule.saveSession).mock.calls[0][0];

            // Verify that a default expiry time was set (current time + 3600 seconds)
            expect(sessionArg.expiresAt).toBeGreaterThanOrEqual(beforeTime + 3600 * 1000);
            expect(sessionArg.expiresAt).toBeLessThanOrEqual(afterTime + 3600 * 1000);
        });
    });
});
