import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as sessionModule from '../session';
import { withErrorHandling } from './error-handler';

vi.mock('../session', () => ({
    clearSession: vi.fn().mockResolvedValue(undefined),
}));

const createMockRequest = () => {
    return {
        headers: new Headers(),
    } as NextRequest;
};

const createSuccessHandler = () => {
    return vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
};

describe('withErrorHandling middleware', () => {
    let mockRequest: NextRequest;
    let successHandler: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        mockRequest = createMockRequest();
        successHandler = createSuccessHandler();
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
        consoleErrorSpy.mockRestore();
    });

    it('should pass the request to the handler when no error occurs', async () => {
        const middleware = withErrorHandling(successHandler);
        const response = await middleware(mockRequest, { someArg: 'value' });

        expect(successHandler).toHaveBeenCalledWith(mockRequest, { someArg: 'value' });

        expect(response).toBeInstanceOf(Response);

        const responseData = await response.json();
        expect(responseData).toEqual({ success: true });
    });

    it('should handle Invalid Credentials error', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw new Error('Invalid Credentials error message');
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).toHaveBeenCalled();

        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Session expired. Please log in again.',
            sessionExpired: true,
        });
    });

    it('should handle invalid_grant error', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw new Error('Error contains invalid_grant somewhere');
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).toHaveBeenCalled();

        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Session expired. Please log in again.',
            sessionExpired: true,
        });
    });

    it('should handle expired token error', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw new Error('Token has expired or something');
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).toHaveBeenCalled();

        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Session expired. Please log in again.',
            sessionExpired: true,
        });
    });

    it('should handle invalid_token error', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw new Error('This contains invalid_token message');
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).toHaveBeenCalled();

        expect(response.status).toBe(401);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'Session expired. Please log in again.',
            sessionExpired: true,
        });
    });

    it('should handle general errors with 500 status', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw new Error('Some general error');
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).not.toHaveBeenCalled();

        expect(response.status).toBe(500);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'An unexpected error occurred',
        });
    });

    it('should handle non-Error objects', async () => {
        const errorHandler = vi.fn().mockImplementation(() => {
            throw 'string error';
        });

        const middleware = withErrorHandling(errorHandler);
        const response = await middleware(mockRequest);

        expect(errorHandler).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(sessionModule.clearSession).not.toHaveBeenCalled();

        expect(response.status).toBe(500);

        const responseBody = await response.json();
        expect(responseBody).toEqual({
            error: 'An unexpected error occurred',
        });
    });

    it('should pass multiple arguments to the handler', async () => {
        const middleware = withErrorHandling(successHandler);

        const arg1 = { param1: 'value1' };
        const arg2 = { param2: 'value2' };
        const arg3 = 'string-arg';

        await middleware(mockRequest, arg1, arg2, arg3);

        expect(successHandler).toHaveBeenCalledWith(mockRequest, arg1, arg2, arg3);
    });
});
