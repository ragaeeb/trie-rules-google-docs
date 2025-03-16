import { Change } from '@/types/formatting';

export const removeDuplicateChanges = (changes: Change[]): Change[] => {
    const uniqueChanges = [];
    const seen = new Set<string>();

    for (const change of changes) {
        const changeString = JSON.stringify(change);

        if (!seen.has(changeString)) {
            seen.add(changeString);
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
