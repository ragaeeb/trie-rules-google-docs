export const ActionButton = ({
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
        className={`ml-4 px-3 py-1 rounded-md transition-colors duration-200 flex items-center ${
            isSuccess
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default shadow-inner'
                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed shadow-sm transform hover:scale-[1.05] active:scale-[0.95]'
        }`}
        disabled={disabled || isLoading || isSuccess}
        onClick={onClick}
    >
        {isLoading ? (
            <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></span>
                Applying...
            </>
        ) : isSuccess ? (
            <>
                <span className="text-lg mr-1 animate-scale-in">✓</span>
                Applied
            </>
        ) : (
            <>Apply</>
        )}
    </button>
);
