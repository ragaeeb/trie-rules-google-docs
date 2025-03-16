export const SuccessMessage = ({ message }: { message: string }) => (
    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6 shadow-sm animate-slide-down">
        <h2 className="text-lg font-semibold mb-2">Success!</h2>
        <p>{message}</p>
    </div>
);
