'use client';

import type { Change } from '@/types/formatting';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import type { SuccessMessages } from './types';

import { ApplyAllButton } from './ApplyAllButton';
import { BackButton } from './BackButton';
import { ErrorMessage } from './ErrorMessage';
import { ReplacementsList } from './ReplacementsList';
import { SuccessMessage } from './SuccessMessage';

export default function DocumentFormatPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [changes, setChanges] = useState<Change[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingIndex, setApplyingIndex] = useState<null | number>(null);
    const [applyingAll, setApplyingAll] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [successMessages, setSuccessMessages] = useState<SuccessMessages>({});
    const [allSuccess, setAllSuccess] = useState(false);

    useEffect(() => {
        const fetchDocumentFormat = async () => {
            try {
                setLoading(true);
                setError(null);

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

    // Event handlers
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

    // Conditional rendering
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (error && Object.keys(successMessages).length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <ErrorMessage message={error} />
                <BackButton onClick={handleGoBack} />
            </div>
        );
    }

    const allChangesApplied = changes.length > 0 && Object.keys(successMessages).length === changes.length;

    return (
        <div className="max-w-4xl mx-auto p-6 text-content dark:text-content-dark">
            <div className="mb-6">
                <BackButton onClick={handleGoBack} />
                <p className="text-gray-600 dark:text-gray-300 mb-6 animate-fade-in">
                    Review the changes that will be applied to your document
                </p>
            </div>

            {error && <ErrorMessage message={error} />}

            {allSuccess && <SuccessMessage message="All changes have been applied to the document." />}

            <ReplacementsList
                applyingAll={applyingAll}
                applyingIndex={applyingIndex}
                changes={changes}
                onApplyChange={applySingleChange}
                successMessages={successMessages}
            />

            <div className="flex justify-end animate-fade-slide-up" style={{ animationDelay: '200ms' }}>
                <ApplyAllButton
                    disabled={changes.length === 0}
                    isLoading={applyingAll}
                    isSuccess={allChangesApplied}
                    onClick={applyAllChanges}
                />
            </div>
        </div>
    );
}
