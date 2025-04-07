import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { RowDataFields } from '../../context/TableContext';

export type CustomCellInstance<T extends typeof CustomCellBase = typeof CustomCellBase> =
    InstanceType<T>;

export type CustomCellConstructor<T extends typeof CustomCellBase = typeof CustomCellBase> = new (
    ...args: ConstructorParameters<T>
) => CustomCellInstance<T>;

export abstract class CustomCellBase {
    protected globalConfig: GlobalConfig;

    protected el: HTMLElement;

    protected row: RowDataFields;

    protected serviceName: string;

    protected field: string;

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

    abstract render(): void;
}
