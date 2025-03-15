'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

type Change = {
    replaceAllText: {
        containsText: {
            matchCase: boolean;
            text: string;
        };
        replaceText: string;
    };
};

export default function DocumentFormatPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [changes, setChanges] = useState<Change[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingIndex, setApplyingIndex] = useState<null | number>(null);
    const [applyingAll, setApplyingAll] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [successMessages, setSuccessMessages] = useState<{ [key: number]: string }>({});
    const [allSuccess, setAllSuccess] = useState(false);

    // Fetch document info and format changes
    useEffect(() => {
        const fetchDocumentFormat = async () => {
            try {
                setLoading(true);
                setError(null);

                // Then, get format changes
                const formatResponse = await fetch(`/api/documents/${params.id}/format`);

                if (!formatResponse.ok) {
                    if (formatResponse.status === 401) {
                        router.push('/login?error=session_expired');
                        return;
                    }
                    throw new Error(`Error getting format changes: ${formatResponse.status}`);
                }

                const formatData = await formatResponse.json();
                setChanges(formatData.requests);
            } catch (err) {
                console.error('Error fetching document format:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentFormat();
    }, [params.id, router]);

    const applySingleChange = async (change: Change, index: number) => {
        try {
            setApplyingIndex(index);
            setError(null);

            // Clear any previous success message for this index
            setSuccessMessages((prev) => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });

            const response = await fetch(`/api/documents/${params.id}/format`, {
                body: JSON.stringify({
                    changes: [change],
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login?error=session_expired');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            // Add success message for this index
            setSuccessMessages((prev) => ({
                ...prev,
                [index]: 'Applied successfully!',
            }));

            // Check if all changes are now applied
            const newSuccessMessages = { ...successMessages, [index]: 'Applied successfully!' };
            if (Object.keys(newSuccessMessages).length === changes.length) {
                setAllSuccess(true);
            }
        } catch (err) {
            console.error('Error applying format:', err);
            setError(`Failed to apply change: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setApplyingIndex(null);
        }
    };

    const applyAllChanges = async () => {
        try {
            setApplyingAll(true);
            setError(null);

            const response = await fetch(`/api/documents/${params.id}/format`, {
                body: JSON.stringify({
                    changes,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login?error=session_expired');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            // Mark all changes as successful
            const newSuccessMessages: Record<number, string> = {};
            changes.forEach((_, index) => {
                newSuccessMessages[index] = 'Applied successfully!';
            });
            setSuccessMessages(newSuccessMessages);
            setAllSuccess(true);
        } catch (err) {
            console.error('Error applying all formats:', err);
            setError(`Failed to apply changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setApplyingAll(false);
        }
    };

    const handleGoBack = () => {
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center min-h-[300px]">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4">Loading document format preview...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && Object.keys(successMessages).length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
                <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    onClick={handleGoBack}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const allChangesApplied = changes.length > 0 && Object.keys(successMessages).length === changes.length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors mb-4"
                    onClick={handleGoBack}
                >
                    ← Back to Dashboard
                </button>

                <p className="text-gray-600 mb-6">Review the changes that will be applied to your document</p>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            )}

            {allSuccess && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">Success!</h2>
                    <p>All changes have been applied to the document.</p>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <h2 className="font-medium">Text Replacements</h2>
                    <span className="text-sm text-gray-500">
                        {Object.keys(successMessages).length} of {changes.length} applied
                    </span>
                </div>

                <div className="divide-y">
                    {changes.length > 0 ? (
                        changes.map((change, index) => (
                            <div className="p-4" key={index}>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap">
                                            <span className="line-through text-gray-500 mr-3">
                                                {change.replaceAllText.containsText.text}
                                            </span>
                                            <span className="text-blue-600">{change.replaceAllText.replaceText}</span>
                                        </div>
                                        {change.replaceAllText.containsText.matchCase && (
                                            <span className="text-xs text-gray-500 mt-1 block">Match case: Yes</span>
                                        )}

                                        {/* Success message */}
                                        {successMessages[index] && (
                                            <span className="text-green-500 text-sm mt-1 block">
                                                ✓ {successMessages[index]}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        className={`ml-4 px-3 py-1 rounded-md transition-colors flex items-center ${
                                            successMessages[index]
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
                                        }`}
                                        disabled={applyingIndex === index || applyingAll || !!successMessages[index]}
                                        onClick={() => applySingleChange(change, index)}
                                    >
                                        {applyingIndex === index ? (
                                            <>
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                                                Applying...
                                            </>
                                        ) : successMessages[index] ? (
                                            <>
                                                <span className="text-lg mr-1">✓</span>
                                                Applied
                                            </>
                                        ) : (
                                            <>Apply</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No text replacements to show</div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    className={`px-6 py-2 rounded-md transition-colors ${
                        allChangesApplied
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
                    }`}
                    disabled={changes.length === 0 || applyingAll || allChangesApplied}
                    onClick={applyAllChanges}
                >
                    {applyingAll ? (
                        <span className="flex items-center">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                            Applying All Changes...
                        </span>
                    ) : allChangesApplied ? (
                        <>
                            <span className="text-lg mr-1">✓</span>
                            All Changes Applied
                        </>
                    ) : (
                        'Apply All Changes'
                    )}
                </button>
            </div>
        </div>
    );
}
