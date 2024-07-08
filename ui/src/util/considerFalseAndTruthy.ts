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
 * since splunk does not oeprate on booleans and numbers, but onyl strings
 * here we use mapping to enable compering and oeprating on them
 * @param value value used for mapping
 * @returns maps truthy values into 1 and false into 0, does not midify rest
 */
export function getValueMapTruthyFalse<T>(value: string | T) {
    return (isFalse(value) && '0') || (isTrue(value) && '1') || value;
}
