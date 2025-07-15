import { GlobalConfig } from '../globalConfig/globalConfig';
import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish, NullishFormRecord } from './shareableTypes';
import { BaseFormState, UtilBaseForm } from './BaseFormSharableTypes';

export type CustomHookInstance<T extends typeof CustomHookBase = typeof CustomHookBase> =
    InstanceType<T>;

export type CustomHookConstructor<T extends typeof CustomHookBase = typeof CustomHookBase> = new (
    ...args: ConstructorParameters<T>
) => CustomHookInstance<T>;

export abstract class CustomHookBase {
    protected globalConfig: GlobalConfig;

    protected serviceName: string;

    protected state: BaseFormState;

    protected mode: Mode;

    protected util: UtilBaseForm;

    protected groupName?: string;

    constructor(
        globalConfig: GlobalConfig,
        serviceName: string,
        state: BaseFormState,
        mode: Mode,
        util: UtilBaseForm,
        groupName?: string
    ) {
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.state = state;
        this.mode = mode;
        this.util = util;
        this.groupName = groupName;
    }

    onCreate?(): void;

    onRender?(): void;

    onChange?(
        field: string,
        targetValue: AcceptableFormValueOrNullish,
        tempState: BaseFormState
    ): void;

    onEditLoad?(): void;

    onSave?(datadict?: NullishFormRecord): Promise<boolean> | boolean;

    onSaveSuccess?(): void;

    onSaveFail?(): void;
}
