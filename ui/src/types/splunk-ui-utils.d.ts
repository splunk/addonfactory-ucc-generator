declare module '@splunk/ui-utils/id' {
    /**
     * Creates a Globally Unique Identifier in the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
     * where each x is replaced with a hexadecimal digit from 0 to f, and y is replaced with a
     * hexadecimal digit from 8 to b. This is not compatible with DOM ids, which must
     * start with a letter.
     *
     * @returns {string} A globally unique identifier
     * @public
     */
    export function createGUID(): string;

    /**
     * Creates a Globally Unique Identifier prefixed with one or more letters to create a valid DOM id.
     *
     * @param {string} [prefix='id'] A prefix, which must start with a letter and may only contain
     * letters, digits, hyphens, and underscores.
     * @returns {string} A globally unique identifier prefixed with a valid DOM id
     * @throws {Error} Throws an error if the prefix does not start with a letter or contains invalid characters
     * @public
     */
    export function createDOMID(prefix?: string): string;
}
