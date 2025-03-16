import { type Change } from '@/types/formatting';

import { TextReplacementItem } from './TextReplacementItem';
import { type SuccessMessages } from './types';

type ReplacementsListProps = {
    applyingAll: boolean; // Indicates whether a bulk apply operation is in progress
    applyingIndex: null | number; // Index of the change currently being applied, or null if none
    changes: Change[]; // Array of text changes to display and potentially apply
    onApplyChange: (change: Change, index: number) => void; // Callback function when a change is applied
    successMessages: SuccessMessages; // Map of change indices to success messages
};

export const ReplacementsList = ({
    applyingAll,
    applyingIndex,
    changes,
    onApplyChange,
    successMessages,
}: ReplacementsListProps) => (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden mb-6 shadow-sm bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600 flex justify-between items-center">
            <h2 className="font-medium text-gray-800 dark:text-gray-100">Text Replacements</h2>
            <span className="text-sm text-gray-500 dark:text-gray-300">
                {Object.keys(successMessages).length} of {changes.length} applied
            </span>
        </div>

        <div className="divide-y dark:divide-gray-700">
            {changes.length > 0 ? (
                changes.map((change, index) => (
                    <TextReplacementItem
                        applyingAll={applyingAll}
                        applyingIndex={applyingIndex}
                        change={change}
                        index={index}
                        key={index}
                        onApply={onApplyChange}
                        successMessages={successMessages}
                    />
                ))
            ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No text replacements to show</div>
            )}
        </div>
    </div>
);
