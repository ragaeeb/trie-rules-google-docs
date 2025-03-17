import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearSession, getSession, saveSession } from './session';

vi.mock('iron-session', () => ({
    getIronSession: vi.fn(),
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

describe('session', () => {
    const mockSessionObj = {
        isLoggedIn: false,
        save: vi.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
        vi.resetAllMocks();
        (getIronSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ...mockSessionObj });
        (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

        vi.stubEnv('SESSION_SECRET', 'test-secret');
        vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('getSession', () => {
        it('should call getIronSession with correct parameters in development environment', async () => {
            const result = await getSession();

            expect(cookies).toHaveBeenCalled();
            expect(getIronSession).toHaveBeenCalledWith(
                {},
                {
                    cookieName: 'google-docs-formatter-session',
                    cookieOptions: {
                        httpOnly: true,
                        path: '/',
                        sameSite: 'lax',
                        secure: false,
                    },
                    password: 'test-secret',
                },
            );
            expect(result).toEqual({ ...mockSessionObj, isLoggedIn: false });
        });

        it('should call getIronSession with secure cookie in production environment', async () => {
            vi.stubEnv('NODE_ENV', 'production');

            await getSession();

            expect(getIronSession).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    cookieOptions: expect.objectContaining({
                        secure: true,
                    }),
                }),
            );
        });

        it('should throw an error when SESSION_SECRET is not defined', async () => {
            vi.stubEnv('SESSION_SECRET', undefined);
            (getIronSession as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
                throw new Error('Password is required');
            });

            await expect(getSession()).rejects.toThrow();
        });
    });

    describe('saveSession', () => {
        it('should merge the provided session data with current session', async () => {
            const sessionData = {
                accessToken: 'test-token',
                isLoggedIn: true,
                userInfo: {
                    email: 'test@example.com',
                    id: '123',
                    name: 'Test User',
                    picture: 'https://example.com/pic.jpg',
                },
            };

            await saveSession(sessionData);

            expect(mockSessionObj.save).toHaveBeenCalled();
        });

        it('should return updated session object', async () => {
            const sessionData = {
                accessToken: 'test-token',
                isLoggedIn: true,
            };

            const result = await saveSession(sessionData);

            expect(result).toHaveProperty('isLoggedIn', true);
            expect(result).toHaveProperty('accessToken', 'test-token');
            expect(result).toHaveProperty('save');
        });

        it('should handle saving refresh token', async () => {
            const sessionData = {
                isLoggedIn: true,
                refreshToken: 'refresh-token-123',
            };

            const result = await saveSession(sessionData);

            expect(result).toHaveProperty('refreshToken', 'refresh-token-123');
        });

        it('should maintain existing properties when updating only some fields', async () => {
            const mockSessionWithData = {
                accessToken: 'old-token',
                isLoggedIn: false,
                refreshToken: 'old-refresh-token',
                save: vi.fn().mockResolvedValue(undefined),
                userInfo: { email: 'old@example.com', id: 'old-id', name: 'Old Name', picture: 'old.jpg' },
            };

            (getIronSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ...mockSessionWithData });

            const sessionData = {
                accessToken: 'new-token',
                isLoggedIn: true,
            };

            const result = await saveSession(sessionData);

            expect(result).toHaveProperty('isLoggedIn', true);
            expect(result).toHaveProperty('accessToken', 'new-token');
            expect(result).toHaveProperty('refreshToken', 'old-refresh-token');
            expect(result).toHaveProperty('userInfo.email', 'old@example.com');
        });
    });

    describe('clearSession', () => {
        it('should call save method after clearing the session', async () => {
            const mockSession = {
                accessToken: 'token',
                isLoggedIn: true,
                refreshToken: 'refresh',
                save: vi.fn().mockResolvedValue(undefined),
                userInfo: { email: 'e@mail.com', id: '1', name: 'Name', picture: 'pic' },
            };

            (getIronSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);

            await clearSession();

            expect(mockSession.save).toHaveBeenCalledTimes(1);
        });

        it('should work properly with a session that has no data to clear', async () => {
            const emptySession = {
                isLoggedIn: false,
                save: vi.fn().mockResolvedValue(undefined),
            };

            (getIronSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(emptySession);

            await clearSession();

            expect(emptySession.isLoggedIn).toBe(false);
            expect(emptySession.save).toHaveBeenCalled();
        });
    });
});
