/* eslint-disable class-methods-use-this */
import {
    BaseFormState,
    CustomHookBase,
    GlobalConfig,
    Mode,
    UtilBaseForm,
} from '../../../publicApi';

class Hook extends CustomHookBase {
    constructor(
        globalConfig: GlobalConfig,
        serviceName: string,
        state: BaseFormState,
        mode: Mode,
        util: UtilBaseForm,
        groupName?: string
    ) {
        super(globalConfig, serviceName, state, mode, util, groupName);
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.state = state;
        this.mode = mode;
        this.util = util;
        this.groupName = groupName;
    }

    onCreate() {
        throw new Error('Error handling test in Hook onCreate method');
    }

    onChange() {
        throw new Error('Error handling test in Hook onChange method');
    }

    onRender() {
        throw new Error('Error handling test in Hook onRender method');
    }

    // @ts-expect-error should return boolean
    onSave() {
        throw new Error('Error handling test in Hook onRender method');
    }

    onSaveSuccess() {
        throw new Error('Error handling test in Hook onSaveSuccess method');
    }

    onSaveFail() {
        throw new Error('Error handling test in Hook onSaveFail method');
    }

    /*
    Put logic here to execute javascript after loading edit UI.
    */
    onEditLoad() {
        throw new Error('Error handling test in Hook onEditLoad method');
    }
}

export default Hook;
