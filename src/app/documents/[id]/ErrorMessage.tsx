export const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 shadow-sm animate-slide-down">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{message}</p>
    </div>
);
