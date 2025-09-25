import { invariant } from '../util/invariant';

expect.extend({
    toBeVisuallyEnabled(field: HTMLElement | null | Element) {
        invariant(field);

        if (field.getAttribute('readonly')) {
            return { pass: false, message: () => 'Field contains "readonly" attribute' };
        }

        const ariaDisabled = field.getAttribute('aria-disabled');
        // in sui-5, input does not include aria-disabled = false
        if (ariaDisabled === null) {
            return { pass: true, message: () => 'Field is enabled' };
        }

        return {
            pass: false,
            message: () =>
                `Attribute "aria-disabled" is incorrect expected "false", got "${ariaDisabled}"`,
        };
    },
    toBeVisuallyDisabled(field: HTMLElement | null | Element) {
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
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toBeVisuallyDisabled(): R;
            toBeVisuallyEnabled(): R;
        }
    }
}
