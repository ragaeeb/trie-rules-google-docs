'use client';

import Link from 'next/link';

type Document = {
    id: string;
    name: string;
};

type DocumentItemProps = {
    document: Document;
    index: number;
};

export function DocumentItem({ document, index }: DocumentItemProps) {
    return (
        <li className="animate-fade-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
            <Link
                className="px-4 py-3 flex items-center hover:bg-accent-hover dark:hover:bg-accent-dark-hover transition-colors block group"
                href={`/documents/${document.id}`}
            >
                <div className="text-primary dark:text-primary-dark mr-3 transition-transform duration-200 transform group-hover:scale-110">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                            clipRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
                <span className="truncate text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                    {document.name}
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg
                        className="w-5 h-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                </div>
            </Link>
        </li>
    );
}
