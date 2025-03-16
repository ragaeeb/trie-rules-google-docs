import type { Change } from '@/types/formatting';

import type { SuccessMessages } from './types';

import { ActionButton } from './ActionButton';

export const TextReplacementItem = ({
    applyingAll,
    applyingIndex,
    change,
    index,
    onApply,
    successMessages,
}: {
    applyingAll: boolean;
    applyingIndex: null | number;
    change: Change;
    index: number;
    onApply: (change: Change, index: number) => void;
    successMessages: SuccessMessages;
}) => (
    <div
        className="p-4 border-b dark:border-gray-700 group hover:bg-accent-hover dark:hover:bg-accent-dark-hover transition-colors duration-200 animate-fade-slide-up"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center flex-wrap">
                    <span className="line-through text-gray-500 dark:text-gray-400 mr-3 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                        {change.from}
                    </span>
                    <span className="text-primary dark:text-primary-dark font-medium">{change.to}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    Match case: {!change.caseInsensitive ? 'Yes' : 'No'}
                </span>
                {successMessages[index] && (
                    <span className="text-green-500 dark:text-green-400 text-sm mt-1 block flex items-center animate-slide-right">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        {successMessages[index]}
                    </span>
                )}
            </div>

            <ActionButton
                disabled={applyingAll}
                isLoading={applyingIndex === index}
                isSuccess={!!successMessages[index]}
                onClick={() => onApply(change, index)}
            />
        </div>
    </div>
);
