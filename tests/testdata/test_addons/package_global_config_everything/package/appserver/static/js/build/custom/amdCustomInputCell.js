define([], function () {
  class CustomInputCell {
    /**
     * Custom Row Cell
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Input service name.
     * @param {element} el - The element of the custom cell.
     * @param {Object} row - custom row object.
     * @param {string} field - The cell field name.
     */
    constructor(globalConfig, serviceName, el, row, field) {
      this.globalConfig = globalConfig;
      this.serviceName = serviceName;
      this.el = el;
      this.row = row;
      this.field = field;
    }
    render() {
      let html = "";
      // Check for missing configuration in account
      if (this.row.account_multiple_select === "one") {
        html = "AMD Option One";
      } else if (this.row.account_multiple_select === "two") {
        html = "AMD Option Two";
      } else {
        html = "AMD Option is not available";
      }
      this.el.innerHTML = html;
      return this;
    }
  }
  return CustomInputCell;
});
