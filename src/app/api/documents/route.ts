import { listDocuments } from '@/lib/google-client';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { NextRequest, NextResponse } from 'next/server';

const getDocumentsList = async (req: NextRequest) => {
    const documents = await listDocuments(req.accessToken);
    return NextResponse.json({ documents });
};

export const GET = withErrorHandling(withAuth(getDocumentsList));
