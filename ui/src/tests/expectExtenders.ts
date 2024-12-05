import { invariant } from '../util/invariant';

export const toBeEnabled = (field: HTMLElement | null | Element) => {
    invariant(field);

    if (field.getAttribute('readonly')) {
        return { pass: false, message: () => 'Field contains "readonly" attribute' };
    }

    const ariaDisabled = field.getAttribute('aria-disabled');

    if (ariaDisabled === 'false') {
        return { pass: true, message: () => 'Field is enabled' };
    }

    return {
        pass: false,
        message: () =>
            `Attribute "aria-disabled" is incorrect expected "false", got ${ariaDisabled}`,
    };
};

export const toBeDisabled = (field: HTMLElement | null | Element) => {
    invariant(field);

    if (field.getAttribute('readonly') === null) {
        return {
            pass: false,
            message: () => `Field "readonly" attribute is null`,
        };
    }

    const ariaDisabled = field.getAttribute('aria-disabled');

    if (ariaDisabled === 'true') {
        return { pass: true, message: () => 'Field is disabled' };
    }

    return {
        pass: false,
        message: () =>
            `Attribute "aria-disabled" is incorrect expected "true", got ${ariaDisabled}`,
    };
};
