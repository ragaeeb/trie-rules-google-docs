interface ErrorStateProps {
    message: string;
    title?: string;
}

export function ErrorState({ message, title = 'Error' }: ErrorStateProps) {
    return (
        <div
            className="p-6 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg shadow-sm animate-slide-down"
            role="alert"
        >
            <div className="flex items-start">
                <div className="mr-3 flex-shrink-0 text-red-500 dark:text-red-400">
                    <svg
                        aria-hidden="true"
                        aria-label="Error icon"
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-medium mb-1">{title}</h3>
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}
