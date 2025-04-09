import { RowDataFields } from '../../../../context/TableContext';
import { GlobalConfig } from '../../../../publicApi';

export class CustomCellMockNoRender {
    globalConfig: GlobalConfig;

    el?: HTMLElement;

    row: RowDataFields;

    field: string;

    serviceName: string;

    /**
     * Custom Row Cell
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Input service name.
     * @param {element} el - The element of the custom cell.
     * @param {Object} row - custom row object.
     * @param {string} field - The cell field name.
     */
    constructor(
        globalConfig: GlobalConfig,
        serviceName: string,
        el: HTMLElement,
        row: RowDataFields,
        field: string
    ) {
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.el = el;
        this.row = row;
        this.field = field;
    }
}
