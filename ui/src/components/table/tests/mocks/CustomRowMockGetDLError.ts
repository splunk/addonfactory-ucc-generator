import { RowDataFields } from '../../../../context/TableContext';
import { GlobalConfig } from '../../../../publicApi';

class CustomInputRowErrorInGetDLRows {
    globalConfig: GlobalConfig;

    serviceName: string;

    el: HTMLElement;

    row: RowDataFields;

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

    // eslint-disable-next-line class-methods-use-this
    getDLRows() {
        throw new Error('getDLRows method Error during execution');
    }
}

export default CustomInputRowErrorInGetDLRows;
