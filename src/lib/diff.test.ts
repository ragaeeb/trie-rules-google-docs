import { Change } from '@/types/formatting';
import { describe, expect, it } from 'vitest';

import { mapChangeToGoogleDocReplaceRequest, removeDuplicateChanges } from './diff';

describe('diff', () => {
    describe('removeDuplicateChanges', () => {
        it('should return an empty array when given an empty array', () => {
            const changes: Change[] = [];
            const result = removeDuplicateChanges(changes);
            expect(result).toEqual([]);
        });

        it('should return the same array when there are no duplicates', () => {
            const changes: Change[] = [
                { from: 'hello', to: 'world' },
                { from: 'foo', to: 'bar' },
            ];
            const result = removeDuplicateChanges(changes);
            expect(result).toEqual(changes);
            expect(result.length).toBe(2);
        });

        it('should remove duplicate changes', () => {
            const changes: Change[] = [
                { from: 'hello', to: 'world' },
                { from: 'hello', to: 'world' },
                { from: 'foo', to: 'bar' },
            ];
            const result = removeDuplicateChanges(changes);
            expect(result).toEqual([
                { from: 'hello', to: 'world' },
                { from: 'foo', to: 'bar' },
            ]);
            expect(result.length).toBe(2);
        });

        it('should consider changes with different caseInsensitive values as unique', () => {
            const changes: Change[] = [
                { caseInsensitive: true, from: 'hello', to: 'world' },
                { caseInsensitive: false, from: 'hello', to: 'world' },
                { from: 'hello', to: 'world' },
            ];
            const result = removeDuplicateChanges(changes);
            expect(result).toEqual([
                { caseInsensitive: true, from: 'hello', to: 'world' },
                { caseInsensitive: false, from: 'hello', to: 'world' },
                { from: 'hello', to: 'world' },
            ]);
            expect(result.length).toBe(3);
        });

        it('should preserve the first occurrence of a duplicate change', () => {
            const changes: Change[] = [
                { from: 'first', to: 'occurrence' },
                { from: 'second', to: 'occurrence' },
                { from: 'first', to: 'occurrence' },
            ];
            const result = removeDuplicateChanges(changes);
            expect(result[0]).toEqual({ from: 'first', to: 'occurrence' });
            expect(result[1]).toEqual({ from: 'second', to: 'occurrence' });
            expect(result.length).toBe(2);
        });
    });

    describe('mapChangeToGoogleDocReplaceRequest', () => {
        it('should map a simple change correctly', () => {
            const change: Change = { from: 'hello', to: 'world' };
            const result = mapChangeToGoogleDocReplaceRequest(change);
            expect(result).toEqual({
                replaceAllText: {
                    containsText: {
                        matchCase: true,
                        text: 'hello',
                    },
                    replaceText: 'world',
                },
            });
        });

        it('should set matchCase to false when caseInsensitive is true', () => {
            const change: Change = { caseInsensitive: true, from: 'hello', to: 'world' };
            const result = mapChangeToGoogleDocReplaceRequest(change);
            expect(result).toEqual({
                replaceAllText: {
                    containsText: {
                        matchCase: false,
                        text: 'hello',
                    },
                    replaceText: 'world',
                },
            });
        });

        it('should set matchCase to true when caseInsensitive is false', () => {
            const change: Change = { caseInsensitive: false, from: 'hello', to: 'world' };
            const result = mapChangeToGoogleDocReplaceRequest(change);
            expect(result).toEqual({
                replaceAllText: {
                    containsText: {
                        matchCase: true,
                        text: 'hello',
                    },
                    replaceText: 'world',
                },
            });
        });

        it('should set matchCase to true when caseInsensitive is not provided', () => {
            const change: Change = { from: 'hello', to: 'world' };
            const result = mapChangeToGoogleDocReplaceRequest(change);
            expect(result.replaceAllText.containsText.matchCase).toBe(true);
        });

        it('should handle empty strings', () => {
            const change: Change = { from: '', to: '' };
            const result = mapChangeToGoogleDocReplaceRequest(change);
            expect(result).toEqual({
                replaceAllText: {
                    containsText: {
                        matchCase: true,
                        text: '',
                    },
                    replaceText: '',
                },
            });
        });
    });
});
