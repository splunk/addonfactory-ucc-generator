import { ValueByField, Field, Value } from './types';

export function parseValue(collection?: string): ValueByField {
    const resultMap = new Map<Field, Value>();

    if (!collection) {
        return resultMap;
    }

    const splitValues = collection.split(',');
    splitValues.forEach((rawValue) => {
        const [field, inputValue] = rawValue.trim().split('/');
        const parsedInputValue = inputValue === '' ? undefined : Number(inputValue);
        if (!field || Number.isNaN(parsedInputValue)) {
            throw new Error(`Value is not parsable: ${collection}`);
        }

        resultMap.set(field, {
            checkbox: true,
            inputValue: parsedInputValue,
        });
    });

    return resultMap;
}

export function packValue(map: ValueByField): string {
    return Array.from(map.entries())
        .filter(([, value]) => value.checkbox)
        .map(([field]) => `${field}`)
        .join(',');
}
