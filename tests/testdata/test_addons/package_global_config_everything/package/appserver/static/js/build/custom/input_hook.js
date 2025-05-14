class Hook {
    /**
     * Form hook
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {string} serviceName - Service name
     * @param {object} state - object with state of the components on the servcice/page
     * @param {string} mode - edit,create or clone
     * @param {object} util - the utility object
     */
    constructor(globalConfig, serviceName, state, mode, util, groupName) {
        this.globalConfig = globalConfig;
        this.serviceName = serviceName;
        this.state = state;
        this.mode = mode;
        this.util = util;
        this.groupName = groupName;
        this._debouncedNameChange = this.debounce(this._nameChange.bind(this), 200);
        console.log('Inside Hook mode: ', mode);
    }

    onCreate() {
        if (this.mode == "create") {
            console.log('in Hook: onCreate');
            // This is an example of how to store groupName value for a particular form field.
            this.util.setState((prevState) => {
                let data = { ...prevState.data };
                data.name.value = this.groupName;
                return { data };
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        // This is the function that is returned and will be executed many times
        // We spread (...args) to capture any number of parameters we want to pass
        return function executedFunction(...args) {
            // The callback function to be executed after
            // the debounce time has elapsed
            // This will reset the waiting every function execution.
            // This is the step that prevents the function from
            // being executed because it will never reach the
            // inside of the previous setTimeout
            clearTimeout(timeout);

            // Restart the debounce waiting period.
            // setTimeout returns a truthy value
            timeout = setTimeout(() => {func(...args)}, wait);
        }
    }

    onChange(field, value, dataDict) {
        console.log('in Hook: onChange ', field, ' value : ', value);
        console.log('in Hook: onChange state: ', this.state);
        if (field === "name") {
          this._debouncedNameChange(dataDict)
        }
    }

    onRender() {
        console.log('in Hook: onRender');
    }

    /* 
        Put form validation logic here.
        Return ture if validation pass, false otherwise.
        Call displayErrorMsg when validtion failed.
    */
    onSaveSuccess() {
        console.log('in Hook: onSaveSuccess');
    }

    onSaveFail() {
        console.log('in Hook: onSaveFail');
    }

    /*
    Put logic here to execute javascript after loading edit UI.
    */
    onEditLoad() {
        console.log('in Hook: onEditLoad');
    }

    _nameChange(dataDict) {
        console.log('in Hook: _nameChange');            
    }
}

export default Hook;
