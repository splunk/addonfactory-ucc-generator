class CustomControl {
    /**
     *
     * @constructor
     * @param {object} globalConfig - Global configuration.
     * @param {element} el - The element of the custom row.
     * @param {object} data - Mode, serviceName, and value.
     * @param {object} util - The utility object.
     * @param {function} setValue - set value of the custom field.
     */
    constructor(globalConfig, el, data, setValue, util) {
        console.log('globalConfig, el, data, setValue, util', {
            globalConfig,
            el,
            data,
            setValue,
            util,
        });
        this.globalConfig = globalConfig;
        this.el = el;
        this.data = data;
        this.util = util;
        this.setValue = setValue;

        this._onSelectOptionChange = this._onSelectOptionChange.bind(this);
    }

    _onSelectOptionChange(event) {
        this.setValue(event.target.value);
    }

    validation(field, value) {
        // Validation logic for value. Return the error message if failed.
        if (value === 'input_two') {
            return 'Wrong value selected.';
        }
    }

    render() {
        console.log('this CustomControl', this);
        let content_html = `
            <select id="custom_control">
                <option value="input_one">Input One</option>
                <option value="input_two">Input Two</option>
            </select>
        `;

        this.el.innerHTML = content_html;
        this.el.addEventListener('change', this._onSelectOptionChange);

        return this;
    }
}

export default CustomControl;
