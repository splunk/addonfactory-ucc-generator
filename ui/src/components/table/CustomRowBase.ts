import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { RowDataFields } from '../../context/TableContext';

export type CustomRowInstance<T extends typeof CustomRowBase = typeof CustomRowBase> =
    InstanceType<T>;

export type CustomRowConstructor<T extends typeof CustomRowBase = typeof CustomRowBase> = new (
    ...args: ConstructorParameters<T>
) => CustomRowInstance<T>;

export abstract class CustomRowBase {
    protected globalConfig: GlobalConfig;

    protected el: HTMLElement | null;

    protected row: RowDataFields;

    protected serviceName: string;

    constructor(
        globalConfig: GlobalConfig,
        serviceName: string,
        el: HTMLElement | null,
        row: RowDataFields
    ) {
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.el = el;
        this.row = row;
    }

    abstract render(): void;

    abstract getDLRows(): RowDataFields;
}
