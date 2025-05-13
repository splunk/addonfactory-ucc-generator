import { RowDataFields } from '../../../../context/TableContext';
import { CustomCellBase, GlobalConfig } from '../../../../publicApi';
import { invariant } from '../../../../util/invariant';

export class CustomCellMock extends CustomCellBase {
    globalConfig: GlobalConfig;

    el: HTMLElement;

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
        super(globalConfig, serviceName, el, row, field);
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.el = el;
        this.row = row;
        this.field = field;
    }

    render() {
        invariant(this.el, 'Custom cell element is not defined');
        let html = '';
        // Check for missing configuration in account
        if (this.row.interval === 10) {
            html = 'Ten seconds';
        } else if (this.row.interval === 11) {
            html = 'Eleven seconds';
        } else if (this.row.interval === 12) {
            html = 'Twelve seconds';
        } else {
            html = String(this.row.interval) ?? '';
        }
        this.el.innerHTML = html;
        return this;
    }
}
