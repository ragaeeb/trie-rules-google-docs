import * as googleClientModule from '@/lib/google-client';
import * as nextServer from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

vi.mock('@/lib/google-client', () => ({
    createOAuth2Client: vi.fn(),
    generateAuthUrl: vi.fn(),
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn().mockImplementation((data, options) => ({ data, ...options })),
    },
}));

describe('Google Auth Initiation Route', () => {
    let mockOAuthClient: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        mockOAuthClient = {};
        vi.mocked(googleClientModule.createOAuth2Client).mockReturnValue(mockOAuthClient);
        vi.mocked(googleClientModule.generateAuthUrl).mockReturnValue('https://accounts.google.com/auth-url');

        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
        consoleErrorSpy.mockRestore();
    });

    it('should redirect to Google OAuth URL', async () => {
        const response = await GET();

        expect(googleClientModule.createOAuth2Client).toHaveBeenCalled();
        expect(googleClientModule.generateAuthUrl).toHaveBeenCalledWith(mockOAuthClient);

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(302);
        expect(response.headers.get('Location')).toBe('https://accounts.google.com/auth-url');
    });

    it('should return error response if authentication initiation fails', async () => {
        const testError = new Error('Auth initialization failed');
        vi.mocked(googleClientModule.generateAuthUrl).mockImplementation(() => {
            throw testError;
        });

        await GET();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error initiating Google auth:', testError);
        expect(nextServer.NextResponse.json).toHaveBeenCalledWith(
            { error: 'Failed to initiate authentication' },
            { status: 500 },
        );
    });
});
