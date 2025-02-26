import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { UtilBaseForm } from '../../types/components/BaseFormTypes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { ControlData } from './CustomControl.types';

type ValueSetter = (newValue: AcceptableFormValueOrNullish) => void;

export type CustomControlInstance<T extends typeof CustomControlBase = typeof CustomControlBase> =
    InstanceType<T>;

export type CustomControlConstructor<
    T extends typeof CustomControlBase = typeof CustomControlBase
> = new (...args: ConstructorParameters<T>) => CustomControlInstance<T>;

abstract class CustomControlBase {
    protected globalConfig: GlobalConfig;

    protected el: HTMLElement;

    protected data: ControlData;

    protected setValue: ValueSetter;

    protected util: UtilBaseForm;

    constructor(
        globalConfig: GlobalConfig,
        el: HTMLElement,
        data: ControlData,
        setValue: ValueSetter,
        util: UtilBaseForm
    ) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.data = data;
        this.setValue = setValue;
        this.util = util;
    }

    abstract render(): void;

    validation?(field: string, value: ControlData['value']): string | undefined;
}

export { CustomControlBase };
