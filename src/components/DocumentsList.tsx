'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DocumentItem } from './DocumentItem';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingSpinner } from './LoadingSpinner';

type Document = {
    id: string;
    name: string;
};

type DocumentsListProps = {
    viewMode: 'grid' | 'list';
};

export function DocumentsList({ viewMode }: DocumentsListProps) {
    const router = useRouter();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/documents');

                if (!response.ok) {
                    const errorData = await response.json();

                    // Check if session expired
                    if (response.status === 401 && errorData.sessionExpired) {
                        router.push('/login?error=session_expired');
                        return;
                    }

                    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setDocuments(data.documents || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load documents');
                console.error('Error fetching documents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (documents.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'max-w-3xl'}>
            {viewMode === 'list' ? (
                <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600 flex justify-between items-center">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100">Select a document to format</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{documents.length} documents</span>
                    </div>
                    <ul className="divide-y dark:divide-gray-700">
                        {documents.map((doc, index) => (
                            <DocumentItem document={doc} index={index} key={doc.id} viewMode={viewMode} />
                        ))}
                    </ul>
                </div>
            ) : (
                <>
                    {documents.map((doc, index) => (
                        <DocumentItem document={doc} index={index} key={doc.id} viewMode={viewMode} />
                    ))}
                </>
            )}
        </div>
    );
}
