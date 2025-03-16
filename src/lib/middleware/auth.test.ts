import * as sessionModule from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withAuth } from './auth';

vi.mock('@/lib/session', () => ({
    getSession: vi.fn(),
}));

const createMockRequest = () => {
    return {
        headers: new Headers(),
    } as NextRequest;
};

const createMockHandler = () => {
    return vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
};

describe('auth', () => {
    describe('withAuth', () => {
        let mockRequest: NextRequest;
        let mockHandler: any;
        let consoleErrorSpy: any;

        beforeEach(() => {
            mockRequest = createMockRequest();
            mockHandler = createMockHandler();
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            vi.resetAllMocks();
            consoleErrorSpy.mockRestore();
        });

        it('should pass the request to the handler when user is authenticated', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: 'valid-token',
                isLoggedIn: true,
            } as any);

            const middleware = withAuth(mockHandler);

            const response = await middleware(mockRequest, { someArg: 'value' });

            expect(mockRequest.accessToken).toBe('valid-token');

            expect(mockHandler).toHaveBeenCalledWith(mockRequest, { someArg: 'value' });

            expect(response).toBeInstanceOf(Response);

            const responseData = await response.json();
            expect(responseData).toEqual({ success: true });
        });

        it('should return 401 when user is not logged in', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: undefined,
                isLoggedIn: false,
            } as any);

            const middleware = withAuth(mockHandler);

            const response = await middleware(mockRequest);

            expect(mockHandler).not.toHaveBeenCalled();

            expect(response.status).toBe(401);

            const responseBody = await response.json();
            expect(responseBody).toEqual({
                error: 'Unauthorized',
                sessionExpired: true,
            });
        });

        it('should return 401 when access token is missing', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: undefined,
                isLoggedIn: true,
            } as any);

            const middleware = withAuth(mockHandler);

            const response = await middleware(mockRequest);

            expect(mockHandler).not.toHaveBeenCalled();

            expect(response.status).toBe(401);

            const responseBody = await response.json();
            expect(responseBody).toEqual({
                error: 'Unauthorized',
                sessionExpired: true,
            });
        });

        it('should handle exceptions from getSession', async () => {
            const testError = new Error('Session error');
            vi.mocked(sessionModule.getSession).mockRejectedValue(testError);

            const middleware = withAuth(mockHandler);

            const response = await middleware(mockRequest);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Auth middleware error:', testError);

            expect(response.status).toBe(500);

            const responseBody = await response.json();
            expect(responseBody).toEqual({
                error: 'Authentication error',
            });
        });

        it('should handle exceptions thrown by the handler', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: 'valid-token',
                isLoggedIn: true,
            } as any);

            const errorHandler = vi.fn().mockImplementation(() => {
                throw new Error('Handler error');
            });

            const middleware = withAuth(errorHandler);

            const response = await middleware(mockRequest);

            expect(mockRequest.accessToken).toBe('valid-token');

            expect(errorHandler).toHaveBeenCalled();

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy.mock.calls[0][0]).toBe('Auth middleware error:');
            expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Handler error');

            expect(response.status).toBe(500);

            const responseBody = await response.json();
            expect(responseBody).toEqual({
                error: 'Authentication error',
            });
        });

        it('should pass multiple arguments to the handler', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: 'valid-token',
                isLoggedIn: true,
            } as any);

            const middleware = withAuth(mockHandler);

            const arg1 = { param1: 'value1' };
            const arg2 = { param2: 'value2' };
            const arg3 = 'string-arg';

            await middleware(mockRequest, arg1, arg2, arg3);

            expect(mockHandler).toHaveBeenCalledWith(mockRequest, arg1, arg2, arg3);
        });

        it('should not modify the original handler response', async () => {
            vi.mocked(sessionModule.getSession).mockResolvedValue({
                accessToken: 'valid-token',
                isLoggedIn: true,
            } as any);

            const customResponse = NextResponse.json(
                {
                    customData: 'test',
                    nested: { value: true },
                },
                {
                    headers: { 'X-Custom-Header': 'test-value' },
                    status: 201,
                },
            );

            const customHandler = vi.fn().mockResolvedValue(customResponse);

            const middleware = withAuth(customHandler);

            const response = await middleware(mockRequest);

            expect(response.status).toBe(201);
            expect(response.headers.get('X-Custom-Header')).toBe('test-value');

            const responseBody = await response.json();
            expect(responseBody).toEqual({
                customData: 'test',
                nested: { value: true },
            });
        });
    });
});
