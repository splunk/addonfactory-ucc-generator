import { StandardPages } from '../types/components/shareableTypes';

export function isFalse(value: unknown) {
    return (
        value === null ||
        value === undefined ||
        ['0', 'FALSE', 'F', 'N', 'NO', 'NONE', ''].includes(value.toString().toUpperCase())
    );
}

export function isTrue(value: unknown) {
    return (
        value !== null &&
        value !== undefined &&
        ['1', 'TRUE', 'T', 'Y', 'YES'].includes(value.toString().toUpperCase())
    );
}

/**
 * Only confuguration page!
 * since splunk does not operate on booleans and numbers, but only strings
 * use mapping to enable comparing and operating on them
 * values used on configuration page are mapped to 0 and 1
 * @param value value used for mapping
 * @returns maps truthy values into 1 and false into 0, does not modify rest
 */
export function getValueMapTruthyFalse<T>(value: string | T, currentPageName?: StandardPages) {
    return (
        (currentPageName === 'configuration' &&
            ((isFalse(value) && '0') || (isTrue(value) && '1'))) ||
        value
    );
}
