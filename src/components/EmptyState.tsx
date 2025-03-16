export function EmptyState() {
    return (
        <div className="p-8 text-center bg-secondary dark:bg-secondary-dark rounded-lg shadow-sm border dark:border-gray-700 animate-fade-in">
            <div className="inline-block p-3 bg-white dark:bg-gray-700 rounded-full mb-4 shadow-sm">
                <svg
                    className="w-8 h-8 text-primary dark:text-primary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                    />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">No Documents Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No documents found in your Google Drive.</p>
            <a
                className="inline-flex items-center px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-hover dark:hover:bg-primary-dark-hover transition-colors duration-200 shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
                href="https://docs.google.com"
                rel="noopener noreferrer"
                target="_blank"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                Create a Document
            </a>
        </div>
    );
}
