import { buildTrie, MatchType } from 'trie-rules';
import { describe, expect, it } from 'vitest';

import { formatParagraphBody } from './formatting';

describe('formatting', () => {
    describe('formatParagraphBody', () => {
        it('should format the element', () => {
            const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

            const actual = formatParagraphBody(
                { paragraph: { elements: [{ textRun: { content: 'The hadith of Al-Dhahabi', textStyle: {} } }] } },
                trie,
            );

            expect(actual).toEqual([
                {
                    from: 'The hadith of Al-Dhahabi',
                    to: 'The hadīth of al-Dhahabi',
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
