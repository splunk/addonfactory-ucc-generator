import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { parseFunctionRawStr } from '../Validator';

describe('parseFunctionRawStr', () => {
    it('parses and executes a validator from global config correctly', () => {
        const config = getGlobalConfigMock();

        const validatorFunctionStr = `
            function validateStartDate(dataDict) {
                const provided_datetime = new Date(dataDict['start_date']).getTime();
                const current_datetime = new Date().getTime();
                if (provided_datetime > current_datetime) {
                    return 'Start date should not be in future';
                }
                return true;
            }
        `;

        const services = config.pages.inputs?.services ?? [];
        expect(services.length).toBeGreaterThan(0);

        services[0].options = {
            ...services[0].options,
            saveValidator: validatorFunctionStr,
        };

        const { result: validatorFn, error } = parseFunctionRawStr(
            services[0].options.saveValidator!
        );

        expect(error).toBeUndefined();
        expect(typeof validatorFn).toBe('function');

        const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
        const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day

        expect(validatorFn?.({ start_date: futureDate })).toBe(
            'Start date should not be in future'
        );
        expect(validatorFn?.({ start_date: pastDate })).toBe(true);
    });

    it('should parses a valid arrow function string', () => {
        const fnStr = '(data) => data.value === "valid"';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({ value: 'valid' })).toBe(true);
    });

    it('should returns an error for a malformed function string', () => {
        const malformed = '(data => { return data. }';
        const { error, result } = parseFunctionRawStr(malformed);
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });

    it('should returns an error when code returns a non-function value', () => {
        const body = 'return "this is not a function";';
        const { error, result } = parseFunctionRawStr(body);
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });

    it('should parses a named function string', () => {
        const fnStr = 'function validate(data) { return data.x === 5; }';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({ x: 5 })).toBe(true);
    });

    it('should handles harmless console-logging functions', () => {
        const fnStr = '(data) => { console.log("test case"); return true; }';
        const { error, result } = parseFunctionRawStr(fnStr);
        expect(error).toBeUndefined();
        expect(result?.({})).toBe(true);
    });

    it('should returns error for empty string', () => {
        const { error, result } = parseFunctionRawStr('');
        expect(error).toMatch(/is not a function/i);
        expect(result).toBeUndefined();
    });
});
