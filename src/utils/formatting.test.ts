import { buildTrie, MatchType } from 'trie-rules';
import { describe, expect, it } from 'vitest';

import { formatParagraphBody } from './formatting';

describe('formatting', () => {
    it('should format the element', () => {
        const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

        const actual = formatParagraphBody(
            { paragraph: { elements: [{ textRun: { content: 'The hadith of Al-Dhahabi', textStyle: {} } }] } },
            trie,
        );

        expect(actual).toEqual([
            {
                replaceAllText: {
                    containsText: { matchCase: true, text: 'The hadith of Al-Dhahabi' },
                    replaceText: 'The hadīth of al-Dhahabi',
                },
            },
        ]);
    });

    it('should skip links', () => {
        const trie = buildTrie([{ from: ['hadith'], options: { match: MatchType.Whole }, to: 'hadīth' }]);

        const actual = formatParagraphBody(
            {
                paragraph: {
                    elements: [
                        { textRun: { content: 'The ʿulamāʾʾ are scholars', textStyle: {} } },
                        { textRun: { content: 'http://hadith.com', textStyle: { link: { url: 'link' } } } },
                    ],
                },
            },
            trie,
        );

        expect(actual).toEqual([]);
    });
});
