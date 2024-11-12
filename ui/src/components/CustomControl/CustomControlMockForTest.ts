import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { UtilControlWrapper } from '../BaseFormView/BaseFormTypes';

export class CustomControlMockForTest {
    globalConfig: GlobalConfig;

    el?: Element;

    data: { mode: Mode; serviceName: string; value: AcceptableFormValueOrNullish };

    util: UtilControlWrapper;

    setValue: (newValue: AcceptableFormValueOrNullish) => void;

    /**
     *
     * @constructor
     * @param {object} globalConfig - Global configuration.
     * @param {element} el - The element of the custom row.
     * @param {object} data - Mode, serviceName, and value.
     * @param {function} setValue - set value of the custom field.
     * @param {object} util - The utility object.
     */
    constructor(
        globalConfig: GlobalConfig,
        el: Element | undefined,
        data: { mode: Mode; serviceName: string; value: AcceptableFormValueOrNullish },
        setValue: (newValue: AcceptableFormValueOrNullish) => void,
        util: UtilControlWrapper
    ) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.data = data;
        this.util = util;
        this.setValue = setValue;
        this.onSelectOptionChange = this.onSelectOptionChange.bind(this);
    }

    onSelectOptionChange(event?: { target: EventTarget | null } | null) {
        this.setValue((event?.target as HTMLSelectElement)?.value);
    }

    /* eslint-disable class-methods-use-this */
    validation(_field: string, value: string) {
        // Validation logic for value. Return the error message if failed.
        if (value === 'input_two') {
            return 'Wrong value selected.';
        }

        return undefined;
    }

    render() {
        if (!this.el) {
            return this;
        }

        const options = ['input_default', 'input_one', 'input_two', 'input_three'].map(
            (value) =>
                `<option value="${value}" ${
                    value === this?.data?.value ? 'selected' : ''
                }>${value}</option>`
        );
        // using direct html string as thats the recommended way in docs
        const contentHTML = `
            <select id="custom_control" data-test="customSelect">
            ${options.join('')}
            </select>
        `;

        this.el.innerHTML = contentHTML;
        this.el.addEventListener('change', this.onSelectOptionChange);

        return this;
    }
}

export default CustomControlMockForTest;
