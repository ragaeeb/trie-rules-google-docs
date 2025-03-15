import { getDocsApi, getDocument, getValidAccessToken } from '@/lib/google-client';
import { isUserLoggedIn } from '@/lib/session';
import { Change } from '@/types/formatting';
import { formatParagraphBody } from '@/utils/formatting';
import { NextRequest, NextResponse } from 'next/server';
import { buildTrie, type TrieNode } from 'trie-rules';

const getRules = async (): Promise<TrieNode> => {
    console.info(`Download rules...`);

    const response = await fetch(process.env.API_PATH_RULES as string);
    const data = await response.json();

    const trie = buildTrie(data);

    console.info(`${data.length} rules processed`);

    return trie;
};

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    console.log('/documents/id/format', params);

    try {
        const loggedIn = await isUserLoggedIn();

        if (!loggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await getValidAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token available' }, { status: 401 });
        }

        const [document, rules] = await Promise.all([getDocument(accessToken, params.id), getRules()]);
        console.log('document', document.id, 'fetched and rules');

        const requests: Change[] = [];

        document.body?.content?.forEach((element) => {
            requests.push(...formatParagraphBody(element, rules));
        });

        Object.values(document.footnotes || {}).forEach((footnote) => {
            footnote?.content?.forEach((element) => {
                requests.push(...formatParagraphBody(element, rules));
            });
        });

        return NextResponse.json({
            requests: removeDuplicateChanges(requests),
        });
    } catch (error) {
        console.error(`Error generating preview for document ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    console.log('POST /documents/id/format', params);

    try {
        const loggedIn = await isUserLoggedIn();

        if (!loggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await getValidAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token available' }, { status: 401 });
        }

        const docsApi = getDocsApi(accessToken);
        const body = await req.json();
        const changes = body.changes as Change[];

        console.log('requests', JSON.stringify(changes, null, 2));

        try {
            await docsApi.documents.batchUpdate({
                documentId: params.id,
                requestBody: { requests: changes },
            });
        } catch (err: any) {
            if (err.status === 500) {
                console.warn('Initial request failed, retrying with reversed array of diff.');

                await docsApi.documents.batchUpdate({
                    documentId: params.id,
                    requestBody: { requests: changes.reverse() },
                });
            } else {
                throw err;
            }
        }

        console.info(`Document updated successfully.`);

        return NextResponse.json({
            message: `Applied bold formatting to document`,
            success: true,
        });
    } catch (error) {
        console.log(JSON.stringify(error));
        console.error(`Error formatting document ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to format document' }, { status: 500 });
    }
}

const removeDuplicateChanges = (changes: Change[]): Change[] => {
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
