/**
 * Reusable LoadingSpinner component
 * Can be used throughout the application for consistent loading states
 */
export function LoadingSpinner({
    containerClassName = '',
    message = 'Loading...',
    minHeight = '300px',
    withBorder = false,
}: {
    containerClassName?: string;
    message?: string;
    minHeight?: string;
    withBorder?: boolean;
}) {
    const defaultContainerClasses = 'flex justify-center items-center animate-fade-in';
    const borderClasses = withBorder
        ? 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm animate-pulse-slow'
        : '';

    return (
        <div className={`${defaultContainerClasses} ${borderClasses} ${containerClassName}`} style={{ minHeight }}>
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 dark:border-blue-500 border-r-transparent mb-4 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
        </div>
    );
}
