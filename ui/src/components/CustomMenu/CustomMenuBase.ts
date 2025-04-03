import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { UtilBaseForm } from '../../types/components/BaseFormTypes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';


export type CustomMenuInstance<T extends typeof CustomMenuBase = typeof CustomMenuBase> =
    InstanceType<T>;

export type CustomMenuConstructor<
    T extends typeof CustomMenuBase = typeof CustomMenuBase
> = new (...args: ConstructorParameters<T>) => CustomMenuInstance<T>;

export abstract class CustomMenuBase {
    protected globalConfig: GlobalConfig;

    protected el: HTMLElement;

    protected setValue: (val: { service: string; input?: string }) => void;

    constructor(
        globalConfig: GlobalConfig,
        el: HTMLElement,
        setValue: (val: { service: string; input?: string }) => void
    ) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.setValue = setValue;
    }

    abstract render(): void;
}
