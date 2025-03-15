import { ContentElement } from '@/types/document';
import { Change } from '@/types/formatting';
import {
    normalizeApostrophes,
    normalizeArabicPrefixesToAl,
    normalizeDoubleApostrophes,
    replaceSalutationsWithSymbol,
} from 'bitaboom';
import { searchAndReplace, TrieNode } from 'trie-rules';

export const formatParagraphBody = (element: ContentElement, trie: TrieNode): Change[] => {
    const changes: Change[] = [];

    if (element.paragraph) {
        let paragraphText = '';

        for (const el of element.paragraph.elements) {
            const textRun = el.textRun;

            if (textRun?.textStyle?.link) {
                console.warn(`Skipping link: ${textRun.content}`);
                continue;
            }

            if (textRun?.content) {
                paragraphText += textRun.content;
            }
        }

        const searchAndReplaceWithTrie = (text: string) => searchAndReplace(trie, text);

        const modifiedText = [
            normalizeApostrophes,
            replaceSalutationsWithSymbol,
            searchAndReplaceWithTrie,
            normalizeArabicPrefixesToAl,
            normalizeDoubleApostrophes,
        ].reduce((text, formatter) => formatter(text), paragraphText);

        if (modifiedText.trim() !== paragraphText.trim()) {
            //console.trace(`${picocolors.dim(paragraphText)} -> ${picocolors.italic(modifiedText)}`);

            changes.push({
                replaceAllText: {
                    containsText: { matchCase: true, text: paragraphText },
                    replaceText: modifiedText,
                },
            });
        }
    }

    return changes;
};
