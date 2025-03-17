import { removeDuplicateChanges } from '@/lib/diff';
import { applyChangesToDoc, getDocument } from '@/lib/google-client';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { getRules } from '@/lib/rules';
import { Change } from '@/types/formatting';
import { formatParagraphBody } from '@/utils/formatting';
import { NextRequest, NextResponse } from 'next/server';

const getReplacementsForDocument = async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params;

    const [document, rules] = await Promise.all([getDocument(request.accessToken, params.id), getRules()]);

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
};

const postReplacementsForDocument = async (req: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const [params, body] = await Promise.all([props.params, req.json()]);
    console.log('POST /documents/id/format', params);

    const changes = body.changes as Change[];

    try {
        await applyChangesToDoc(params.id, changes, {
            accessToken: req.accessToken,
        });
    } catch (err: any) {
        if (err.status === 500) {
            console.warn('Initial request failed, retrying with reversed array of diff.');

            await applyChangesToDoc(params.id, changes.reverse(), {
                accessToken: req.accessToken,
            });
        } else {
            throw err;
        }
    }

    console.info(`Document updated successfully.`);

    return NextResponse.json({
        message: `Applied formatting to document`,
        success: true,
    });
};

export const GET = withErrorHandling(withAuth(getReplacementsForDocument));
export const POST = withErrorHandling(withAuth(postReplacementsForDocument));
