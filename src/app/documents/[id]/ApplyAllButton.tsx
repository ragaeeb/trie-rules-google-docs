export const ApplyAllButton = ({
    disabled,
    isLoading,
    isSuccess,
    onClick,
}: {
    disabled: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    onClick: () => void;
}) => (
    <button
        className={`px-6 py-2 rounded-md transition-all duration-200 shadow-sm transform hover:scale-[1.02] active:scale-[0.98] ${
            isSuccess
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-default'
                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed'
        }`}
        disabled={disabled || isLoading || isSuccess}
        onClick={onClick}
    >
        {isLoading ? (
            <span className="flex items-center">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                Applying All Changes...
            </span>
        ) : isSuccess ? (
            <>
                <span className="text-lg mr-1 animate-scale-in">✓</span>
                All Changes Applied
            </>
        ) : (
            'Apply All Changes'
        )}
    </button>
);
