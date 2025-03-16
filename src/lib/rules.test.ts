import { buildTrie } from 'trie-rules';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getRules } from './rules';

vi.mock('trie-rules', () => ({
    buildTrie: vi.fn(),
}));

const fetchMock = vi.fn();

vi.stubGlobal('fetch', fetchMock);
vi.stubGlobal('console', { ...console, info: vi.fn() });

describe('Rules Module', () => {
    const mockRulesData = [
        { id: 1, pattern: 'test1', replacement: 'replacement1' },
        { id: 2, pattern: 'test2', replacement: 'replacement2' },
    ];

    const mockTrieNode = { children: {}, isEndOfWord: false, value: null };

    beforeEach(() => {
        vi.resetAllMocks();

        fetchMock.mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockRulesData),
        });

        (buildTrie as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockTrieNode);

        vi.stubEnv('API_PATH_RULES', 'https://api.example.com/rules');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('getRules', () => {
        it('should fetch rules from the API', async () => {
            await getRules();

            expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/rules');
        });

        it('should build a trie from the fetched rules', async () => {
            await getRules();

            expect(buildTrie).toHaveBeenCalledWith(mockRulesData);
        });

        it('should return the trie built from the rules', async () => {
            const result = await getRules();

            expect(result).toEqual(mockTrieNode);
        });

        it('should throw an error when the API request fails', async () => {
            fetchMock.mockRejectedValue(new Error('Network error'));

            await expect(getRules()).rejects.toThrow('Network error');
        });

        it('should handle empty rules array', async () => {
            fetchMock.mockResolvedValue({
                json: vi.fn().mockResolvedValue([]),
            });

            await getRules();

            expect(buildTrie).toHaveBeenCalledWith([]);
        });
    });
});
