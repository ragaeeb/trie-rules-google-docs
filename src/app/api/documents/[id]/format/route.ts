import { formatDocument, getDocument, getValidAccessToken } from '@/lib/google-client';
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
            requests,
        });
    } catch (error) {
        console.error(`Error generating preview for document ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const loggedIn = await isUserLoggedIn();

        if (!loggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await getValidAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token available' }, { status: 401 });
        }

        // Parse and validate request body

        const documentId = params.id;

        // Apply formatting
        await formatDocument(accessToken, documentId, 'bold');

        return NextResponse.json({
            message: `Applied bold formatting to document`,
            success: true,
        });
    } catch (error) {
        console.error(`Error formatting document ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to format document' }, { status: 500 });
    }
}
