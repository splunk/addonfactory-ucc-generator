Custom Hook is a JavaScript function that allows us to reuse some code throughout the app. It is used to validate form/dialog inputs.

Hook is nothing more than a Javascript event handling on the events `onCreate`, `onChange`, `onRender`, `onSave`, `onSaveSuccess`, `onSaveFail`, and `onEditLoad`.

Hooks can be used inside the services and tabs that are placed next to the entity tag. 

The `type` key needs to be set as external to webpack the custom extensions. UCC  expects scripts marked as external to follow the ESM syntax for exporting and importing modules. Any other value, or not specifying type, will default to the old requireJS (AMD) import syntax. Aditionally, the custom javascript file and the imported modules will not get webpack-ed.

### Properties

| Property          | Description |
| ----------------- | ----------- |
| globalConfig       | It is a hierarchical object that contains the globalConfig file's properties and values. |
| serviceName       | It is the name of the service/tab specified in the globalConfig. |
| state             | `state` is an object that represents the actual state value of the components in the service/tab when the hook's constructor is called. Updating this object will not update the state of the page. Use the `util.setState` method to update the page's state. The `state` object contains the actual state data along with the  `errorMsg` and `warningMsg` properties. |
| mode              | There are three possible modes: Edit, Clone, and Delete. These are used in service/tab components. |
| util              | This is a utility object with various functions that can be used to manipulate the page UI. <br>There are 4 associated methods: <ul><li>`clearAllErrorMsg`: ƒ (State)</li><li>`setErrorFieldMsg`: ƒ (field, msg)</li><li>`setErrorMsg`: ƒ (msg)</li><li>`setState`: ƒ setState(callback)</li></ul> |
| groupName         | The name of the menu group from which the inputs service is called. This parameter should only be used with the multi-level menu feature. |

### Methods

We can use these methods to overirde existing methods according to the desired functionality:

| Property          | Description |
| ----------------- | ----------- |
| onCreate          | is called when we click on the "Add/Create" button to create a new record on the page. |
| debounce          | is used to create another special method which does not get executed on every call. This functionality can be useful when listening for an event. <p>For Example, if you might want to show the help text/error when the user has stopped typing for 500ms in a text-box, instead of every key press.  In this scenario, the debounce method will induce a time wait every time a key is pressed and the method will only execute when there is no other call to it within that wait time.</p> |
| onChange          | is called when the value of any field is changed. |
| onRender          | is called once whenever the user clicks on an "Add", "Edit", or "Clone" button. |
| onSave            | is called when the user clicks the "Save" button after creating, editing, or cloning a record. |
| onSaveSuccess     | is called when a record has been successfully saved. |
| onSaveFail        | is called when a record fails to save due to any error. |
| onEditLoad        | is called when the user clicks on an "Edit" button for an existing record. |

### Usage

```
"inputs": {
    "title": "Inputs",
    "description": "Manage your data inputs",
    "services": [
        {
            "name": "example_input_one",
            "title": "Example Input One",
            "hook": {
                "src": "input_hook",
                "type": "external"
            },
            "entity": []
        }
    ]
}
```

### Example

```
import _ from "underscore"; // example of a ESM import

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
                data.test_field.value = this.groupName;
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
    onSave(dataDict) {
        console.log('in Hook: onSave with data: ', dataDict);
        var accountname = dataDict.name;
        var auth_type = dataDict.auth_type;
        var endpoint = dataDict.url;
        
        this.util.setState((prevState) => {
            /*
            Example usage of util.clearAllErrorMsg. It just returns the modified state object after clearing the error messages.
            It won't update the UI.
            */
            let new_state = this.util.clearAllErrorMsg(prevState);
            return new_state
        });

        if (accountname === null || accountname.trim().length === 0) {
            var msg = "Field account name is required";
            this.util.setErrorMsg(msg);
            return false;
        } else if (endpoint === null || endpoint.trim().length === 0) {
            var msg = "Field URL is required";
            this.util.setErrorMsg(msg);
            return false;
        } else if (endpoint.indexOf("https://") !== 0) {
            var msg =
            "URL should start with 'https://' as only secure URLs are supported.";
            this.util.setErrorFieldMsg("url", msg);
            return false;
        } else if (auth_type == "oauth") {
            endpoint = endpoint.replace("https://", ""); //removing the https schema from the endpoint
            this.util.setState((prevState) => {
            let data = { ...prevState.data };
            data.endpoint.value = endpoint;
            return { data };
            });
        }
        return true;
    }

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
```

> Note: The Javascript file for the custom control should be saved in the custom folder at `appserver/static/js/build/custom/`.
