const excludeProps = <T extends object, K extends PropertyKey>(
    obj: T,
    keys: K[]
): Omit<T, Extract<keyof T, K>> => {
    const result = { ...obj };
    keys.forEach((key) => {
        if (key in result) {
            // @ts-expect-error allow to pass keys that does not exist
            delete result[key];
        }
    });
    return result;
};
export const excludeControlWrapperProps = <T extends object>(obj: T) =>
    excludeProps(obj, [
        'addCustomValidator',
        'defaultValue', // value is provided anyway, so no need to pass defaultValue
        'dependencyValues',
        'encrypted',
        'fileNameToDisplay',
        'handleChange',
        'mode',
        'options',
        'page',
        'style',
        'type',
    ]);
