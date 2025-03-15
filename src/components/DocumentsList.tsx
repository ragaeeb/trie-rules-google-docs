'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Document = {
    id: string;
    name: string;
};

export const DocumentsList = () => {
    const router = useRouter();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/documents');

                if (!response.ok) {
                    const errorData = await response.json();

                    // Check if session expired
                    if (response.status === 401 && errorData.sessionExpired) {
                        // Redirect to login page
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

    useEffect(() => {
        const previewFormatting = async (doc: Document) => {
            try {
                const response = await fetch(`/api/documents/${doc.id}/format`);
                if (!response.ok) {
                    // Handle error properly without redirecting
                    console.error('Error fetching format preview:', await response.text());
                    return;
                }
                const data = await response.json();
                console.log('response', data);
            } catch (err) {
                console.error('Error in preview formatting:', err);
                // Don't navigate away, just handle the error locally
            }
        };

        if (selectedDoc) {
            previewFormatting(selectedDoc);
        }
    }, [selectedDoc]);

    if (loading) {
        return <div className="flex justify-center p-8">Loading documents...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-700 bg-red-100 rounded-lg">Error: {error}</div>;
    }

    if (documents.length === 0) {
        return (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No documents found in your Google Drive.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="font-medium">Select a document to format</h3>
                    </div>
                    <ul className="divide-y">
                        {documents.map((doc) => (
                            <li
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                                }`}
                                key={doc.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedDoc(doc);
                                }}
                            >
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                        <path
                                            clipRule="evenodd"
                                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                            fillRule="evenodd"
                                        />
                                    </svg>
                                    <span className="truncate">{doc.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
