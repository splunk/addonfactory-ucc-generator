import { RowDataFields } from '../../../../context/TableContext';
import { GlobalConfig } from '../../../../publicApi';

class CustomInputRowMock {
    el: HTMLElement;

    globalConfig: GlobalConfig;

    row: RowDataFields;

    serviceName: string;

    /**
     * Custom Row Cell
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Input service name.
     * @param {element} el - The element of the custom cell.
     * @param {Object} row - custom row object,
     *     use this.row.<field_name>, where <field_name> is a field name
     */
    constructor(
        globalConfig: GlobalConfig,
        serviceName: string,
        el: HTMLElement,
        row: RowDataFields
    ) {
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.el = el;
        this.row = row;
    }

    getDLRows() {
        return Object.fromEntries(
            Object.entries(this.row).map(([key, value]) => [
                key,
                key === 'interval' ? `${value} sec` : value,
            ])
        );
    }

    render() {
        const content = 'Custom Input Row';
        this.el.innerHTML = content;
        return this;
    }
}

export default CustomInputRowMock;
