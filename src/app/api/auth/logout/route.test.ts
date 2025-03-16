import { clearSession } from '@/lib/session';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { POST } from './route';

vi.mock('@/lib/session', () => ({
    clearSession: vi.fn(),
}));

describe('route', () => {
    beforeEach(() => {
        vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://abc.com');
        vi.stubGlobal('console', {
            ...console,
            error: vi.fn(),
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('POST', () => {
        it('should redirect after clearing the session', async () => {
            const result = await POST();
            expect(clearSession).toHaveBeenCalledTimes(1);

            expect(result).toEqual(expect.objectContaining({ status: 307 }));
            expect(result.headers.get('Location')).toEqual('https://abc.com/login');
        });

        it('should throw a 500 if could not logout', async () => {
            (clearSession as Mock).mockRejectedValue(new Error('Refresh failed'));

            const result = await POST();
            expect(result).toEqual(expect.objectContaining({ status: 500 }));
        });
    });
});
