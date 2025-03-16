import { listDocuments } from '@/lib/google-client';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandling } from '@/lib/middleware/error-handler';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Retrieves a list of Google Docs documents from Google Drive
 * @param req - The NextRequest object with accessToken added by auth middleware
 * @returns JSON response with documents array
 *
 * Response format:
 * {
 *   documents: Array<{
 *     id: string,
 *     name: string,
 *   }>
 * }
 */
const getDocumentsList = async (req: NextRequest) => {
    const documents = await listDocuments(req.accessToken);
    return NextResponse.json({ documents });
};

export const GET = withErrorHandling(withAuth(getDocumentsList));
