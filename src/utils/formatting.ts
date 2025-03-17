import { ContentElement } from '@/types/document';
import { Change } from '@/types/formatting';
import { normalizeApostrophes, normalizeArabicPrefixesToAl, replaceSalutationsWithSymbol } from 'bitaboom';
import { searchAndReplace, TrieNode } from 'trie-rules';

export const formatParagraphBody = (element: ContentElement, trie: TrieNode): Change[] => {
    const changes: Change[] = [];

    if (element.paragraph) {
        let paragraphText = '';

        for (const el of element.paragraph.elements) {
            const textRun = el.textRun;

            if (!textRun?.textStyle?.link && textRun?.content) {
                paragraphText += textRun.content;
            }
        }

        const searchAndReplaceWithTrie = (text: string) => searchAndReplace(trie, text);

        const modifiedText = [
            normalizeApostrophes,
            replaceSalutationsWithSymbol,
            searchAndReplaceWithTrie,
            normalizeArabicPrefixesToAl,
        ].reduce((text, formatter) => formatter(text), paragraphText);

        if (modifiedText.trim() !== paragraphText.trim()) {
            changes.push({
                from: paragraphText.trim(),
                to: modifiedText.trim(),
            });
        }
    }

    return changes;
};
