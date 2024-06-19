/* eslint-disable class-methods-use-this */
class TableClickHandler {
    options?: { field?: string };

    constructor(options?: Record<string, unknown> | undefined) {
        this.options = options;
    }

    canHandle(event: { type: string; payload?: Record<string, unknown> }) {
        // eslint-disable-next-line no-console
        console.log('clicked', {
            cellIndex: event?.payload?.cellIndex,
            rowIndex: event?.payload?.rowIndex,
            value: event?.payload?.value,
            fieldValue: event?.payload?.fieldValue,
        });
        return event.type === 'cell.click';
    }

    handle() {
        // method never used
        return new Promise((r) => r(1));
    }
}

export default TableClickHandler;
