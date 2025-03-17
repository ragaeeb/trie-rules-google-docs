export const BackButton = ({ onClick, text = 'Back to Dashboard' }: { onClick: () => void; text?: string }) => (
    <button
        className="relative z-0 h-12 rounded-full bg-blue-500 px-6 text-neutral-50 after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-full after:rounded-full after:bg-blue-500 hover:after:scale-x-125 hover:after:scale-y-150 hover:after:opacity-0 hover:after:transition hover:after:duration-500 px-4 py-2 bg-secondary dark:bg-secondary-dark hover:bg-secondary-hover dark:hover:bg-secondary-dark-hover rounded-md transition-all duration-200 mb-4 flex items-center shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={onClick}
    >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
        {text}
    </button>
);
