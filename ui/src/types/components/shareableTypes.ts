export type AcceptableFormValue = string | number | boolean | { fileContent?: string };
export type AcceptableFormValueOrNull = AcceptableFormValue | null;
export type AcceptableFormValueOrNullish = AcceptableFormValueOrNull | undefined;

export type AcceptableFormRecord = Record<string, AcceptableFormValueOrNull>;
export type NullishFormRecord = Record<string, AcceptableFormValueOrNullish>;

export type StandardPages = 'configuration' | 'inputs';
export type AllPossiblePages = StandardPages | 'dashboard';
