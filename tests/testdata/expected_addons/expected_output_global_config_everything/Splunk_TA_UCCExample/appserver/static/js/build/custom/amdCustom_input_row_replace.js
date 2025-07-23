define([], function () {
  class CustomInputRow {
    /**
     * Custom Row Cell
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Input service name.
     * @param {element} el - The element of the custom cell.
     * @param {Object} row - custom row object,
     *     use this.row.<field_name>, where <field_name> is a field name
     */
    constructor(globalConfig, serviceName, el, row) {
      this.globalConfig = globalConfig;
      this.serviceName = serviceName;
      this.el = el;
      this.row = row;
    }

    render() {
      const content_html_template = "Custom Input Row";
      this.el.innerHTML = content_html_template;
      return this;
    }
  }

  return CustomInputRow;
});
