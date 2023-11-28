const prefix = 'Invariant failed';

export function invariant(condition: unknown, message?: string): asserts condition {
    if (condition) {
        return;
    }

    const value = message ? `${prefix}: ${message}` : prefix;
    throw new Error(value);
}
