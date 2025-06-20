define([], function () {
  class CustomControl {
    /**
     *
     * @constructor
     * @param {object} globalConfig - Global configuration.
     * @param {element} el - The element of the custom row.
     * @param {object} data - Mode, serviceName, and value.
     * @param {string} data.mode - one of `create`, `edit`, `clone`, or `config`
     * @param {string | boolean | number | undefined} data.value - current value of custom field
     * @param {string} data.serviceName - name of service in which custom field is rendered
     * @param {object} util - The utility object.
     * @param {function} setValue - set value of the custom field.
     */
    constructor(globalConfig, el, data, setValue, util) {
      this.globalConfig = globalConfig;
      this.el = el;
      this.data = data;
      this.util = util;
      this.setValue = setValue;

      this.onSelectOptionChange = this.onSelectOptionChange.bind(this);
    }

    onSelectOptionChange(event) {
      this.setValue(event.target.value);
    }

    validation(field, value) {
      // Validation logic for value. Return the error message if failed.
      if (value === "input_two") {
        return "Wrong value selected.";
      }
    }

    render() {
      let content_html = `
            <select id="custom_control">
                <option value="input_one">Input One</option>
                <option value="input_two">Input Two</option>
            </select>
        `;

      this.el.innerHTML = content_html;
      this.el.addEventListener("change", this.onSelectOptionChange);

      return this;
    }
  }

  return CustomControl;
});
