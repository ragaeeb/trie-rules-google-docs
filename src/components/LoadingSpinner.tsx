/**
 * Renders a customizable loading spinner.
 *
 * Displays a centered spinner animation accompanied by an optional loading message. The container combines
 * default layout and animation styles with optional border, background, and shadow styling when `withBorder` is enabled.
 * Additional CSS classes can be added via `containerClassName` and the container's minimum height is settable via `minHeight`.
 *
 * @param containerClassName - Optional CSS classes to customize the container.
 * @param message - Loading text displayed beneath the spinner (default: "Loading...").
 * @param minHeight - Minimum height of the spinner container (default: "300px").
 * @param withBorder - If true, applies border and styled background to the container (default: false).
 *
 * @returns A JSX element representing the loading spinner.
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
