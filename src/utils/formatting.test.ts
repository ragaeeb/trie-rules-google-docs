import { buildTrie, MatchType } from 'trie-rules';
import { describe, expect, it } from 'vitest';

import { formatParagraphBody } from './formatting';

describe('formatting', () => {
    describe('formatParagraphBody', () => {
        it('should transform hadith to hadīth', () => {
            const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

            const actual = formatParagraphBody(
                { paragraph: { elements: [{ textRun: { content: 'The hadith text', textStyle: {} } }] } },
                trie,
            );

            expect(actual).toEqual([
                {
                    from: 'The hadith text',
                    to: 'The hadīth text',
                },
            ]);
        });

        it('should normalize Arabic prefixes', () => {
            const trie = buildTrie([]);

            const actual = formatParagraphBody(
                { paragraph: { elements: [{ textRun: { content: 'Al-Dhahabi said', textStyle: {} } }] } },
                trie,
            );

            expect(actual).toEqual([
                {
                    from: 'Al-Dhahabi said',
                    to: 'al-Dhahabi said',
                },
            ]);
        });

        it('should format multiple text runs in a paragraph', () => {
            const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

            const actual = formatParagraphBody(
                {
                    paragraph: {
                        elements: [
                            { textRun: { content: 'The first ', textStyle: {} } },
                            { textRun: { content: 'hadith ', textStyle: {} } },
                            { textRun: { content: 'by Al-Dhahabi', textStyle: {} } },
                        ],
                    },
                },
                trie,
            );

            expect(actual).toEqual([
                {
                    from: 'The first hadith by Al-Dhahabi',
                    to: 'The first hadīth by al-Dhahabi',
                },
            ]);
        });

        it('should skip links', () => {
            const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

            const actual = formatParagraphBody(
                {
                    paragraph: {
                        elements: [{ textRun: { content: 'http://hadith.com', textStyle: { link: { url: 'link' } } } }],
                    },
                },
                trie,
            );

            expect(actual).toEqual([]);
        });

        it('should not produce diffs for that which did not change', () => {
            const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

            const actual = formatParagraphBody(
                {
                    paragraph: {
                        elements: [{ textRun: { content: 'The ʿulamāʾʾ are scholars', textStyle: {} } }],
                    },
                },
                trie,
            );

            expect(actual).toEqual([]);
        });
    });
});
