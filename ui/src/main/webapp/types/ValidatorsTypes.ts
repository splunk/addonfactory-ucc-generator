export interface ValidatorBase {
    type: string;
    errorMsg?: string;
}

export interface StringValidator extends ValidatorBase {
    type: 'string';
    minLength: number;
    maxLength: number;
}

export interface RegexValidator extends ValidatorBase {
    type: 'regex';
    pattern: string;
}

export interface NumberValidator extends ValidatorBase {
    type: 'number';
    range: [number, number];
}
