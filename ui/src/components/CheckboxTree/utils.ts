import { ValueByField, Field, Value } from './types';

export function parseValue(collection?: string, delimiter: string = ','): ValueByField {
    if (!collection) {
        return new Map<Field, Value>();
    }

    return new Map(
        collection.split(delimiter).map((rawValue) => [rawValue.trim(), { checkbox: true }])
    );
}

export function packValue(map: ValueByField, delimiter: string = ','): string {
    return Array.from(map.entries())
        .filter(([, value]) => value.checkbox)
        .map(([field]) => `${field}`)
        .join(delimiter);
}
