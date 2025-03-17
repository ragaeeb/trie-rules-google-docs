import { Change } from '@/types/formatting';

/**
 * Removes duplicate changes from the provided array
 */
export const removeDuplicateChanges = (changes: Change[]): Change[] => {
    const uniqueChanges: Change[] = [];
    const seen = new Map<string, Set<string>>();

    for (const change of changes) {
        const fromKey = change.from;

        if (!seen.has(fromKey)) {
            seen.set(fromKey, new Set());
        }

        // Create a unique identifier for the 'to' and 'caseInsensitive' values
        const toKey = `${change.to}:${change.caseInsensitive === undefined ? 'undefined' : change.caseInsensitive}`;
        const seenSet = seen.get(fromKey)!;

        // If we haven't seen this exact change before, add it to our results
        if (!seenSet.has(toKey)) {
            seenSet.add(toKey);
            uniqueChanges.push(change);
        }
    }

    return uniqueChanges;
};

type GoogleDocReplaceRequest = {
    replaceAllText: {
        containsText: {
            matchCase: boolean;
            text: string;
        };
        replaceText: string;
    };
};

export const mapChangeToGoogleDocReplaceRequest = (change: Change): GoogleDocReplaceRequest => {
    return {
        replaceAllText: {
            containsText: {
                matchCase: !change.caseInsensitive,
                text: change.from,
            },
            replaceText: change.to,
        },
    };
};
