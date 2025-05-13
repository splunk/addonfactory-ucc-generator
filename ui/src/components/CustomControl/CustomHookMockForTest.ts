import {
    AvaillableOAuthTypes,
    BaseFormState,
    CustomHookClass,
    GlobalConfig,
    Mode,
    NullishFormRecord,
    UtilBaseForm,
} from '../../publicApi';
import { BaseFormStateData } from '../../types/components/BaseFormTypes';
import { StandardPages } from '../../types/components/shareableTypes';

const debounce = (func: { (state: BaseFormState): void }, wait: number) => {
    let timeout: NodeJS.Timeout | undefined;
    // This is the function that is returned and will be executed many times
    // We spread (...args) to capture any number of parameters we want to pass
    return function executedFunction(state: BaseFormState) {
        // The callback function to be executed after
        // the debounce time has elapsed
        // This will reset the waiting every function execution.
        // This is the step that prevents the function from
        // being executed because it will never reach the
        // inside of the previous setTimeout
        clearTimeout(timeout);

        // Restart the debounce waiting period.
        // setTimeout returns a truthy value
        timeout = setTimeout(() => {
            func(state);
            // console.log('in Hook: debouncedNameChange', {
            //     state,
            // });
        }, wait);
    };
};

class Hook extends CustomHookClass {
    debouncedNameChange: (dataDict: BaseFormState) => void;

    /**
     * Form hook
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Service name
     * @param {object} state - object with state of the components on the servcice/page
     * @param {string} mode - edit,create or clone
     * @param {object} util - the utility object
     */
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
        this.debouncedNameChange = debounce(this.nameChange.bind(this), 200);

        // console.log('Inside Hook mode: ', mode);
    }

    onCreate() {
        if (this.mode === 'create') {
            // // console.log('in Hook: onCreate');
            // This is an example of how to store groupName value for a particular form field.
            this.util.setState((prevState) => {
                const data = { ...prevState.data };
                data.name.value = 'basic value for name loaded from hook';
                return { data };
            });
        }
    }

    onChange(
        field: string,
        value: string | number | boolean | { fileContent?: string } | null | undefined,
        state: {
            serviceName?: string;
            mode?: Mode;
            page?: StandardPages;
            stanzaName?: string;
            data: BaseFormStateData;
            errorMsg?: string;
            warningMsg?: string;
            stateModified?: boolean;
        }
    ) {
        // console.log('in Hook: onChange ', field, ' value : ', value);
        // console.log('in Hook: onChange state: ', this.state);
        if (field === 'name') {
            this.debouncedNameChange(state);
        }
    }

    onRender() {
        // console.log('in Hook: onRender', this.serviceName);

        this.util.setState((prevState) => {
            const data = { ...prevState.data };
            data.name.markdownMessage = {
                markdownType: 'text',
                text: 'This is a markdown message added from hook',
                color: 'red',
            };
            return { data };
        });
    }

    /* 
        Put form validation logic here.
        Return ture if validation pass, false otherwise.
        Call displayErrorMsg when validtion failed.
    */
    onSave(dataDict?: NullishFormRecord) {
        // console.log('in Hook: onSave with data: ', dataDict);
        const accountname = dataDict?.name;
        const { auth_type: authType }: { auth_type?: AvaillableOAuthTypes } = dataDict || {};
        let endpoint = dataDict?.url;

        this.util.setState((prevState) => {
            /*
            Example usage of util.clearAllErrorMsg. It just returns the modified state object after clearing the error messages.
            It won't update the UI.
            */
            const newState = this.util.clearAllErrorMsg(prevState);
            return newState;
        });

        if (
            typeof accountname !== 'string' ||
            accountname === null ||
            accountname?.trim().length === 0
        ) {
            const msg = 'Field account name is required and should be a valid string';
            this.util.setErrorMsg(msg);
            return false;
        }
        if (typeof endpoint !== 'string' || endpoint === null || endpoint?.trim().length === 0) {
            const msg = 'Field URL is required and should be a valid string';
            this.util.setErrorMsg(msg);
            return false;
        }
        if (endpoint.indexOf('https://') !== 0) {
            const msg = "URL should start with 'https://' as only secure URLs are supported.";
            this.util.setErrorFieldMsg('url', msg);
            return false;
        }
        if (authType === 'oauth') {
            endpoint = endpoint.replace('https://', ''); // removing the https schema from the endpoint
            this.util.setState((prevState) => {
                const data = { ...prevState.data };
                data.endpoint.value = endpoint;
                return { data };
            });
        }
        return true;
    }

    onSaveSuccess() {
        // return value does not matter
        return this.serviceName;
    }

    onSaveFail() {
        // return value does not matter
        return this.serviceName;
    }

    /*
    Put logic here to execute javascript after loading edit UI.
    */
    onEditLoad() {
        // return value does not matter
        return this.serviceName;
    }

    nameChange(state: BaseFormState) {
        // console.log('in Hook: nameChange this.serviceName', {
        //     serviceName: this.serviceName,
        //     state,
        // });
        if (state?.data?.name.value === 'addNumberAtEndInHook') {
            this.util.setState((prevState) => {
                const data = { ...prevState.data };
                data.name.value = `${state?.data?.name.value}321`;
                return { data };
            });
        }
    }
}

export default Hook;
