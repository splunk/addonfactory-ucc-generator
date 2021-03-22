import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Message from '@splunk/react-ui/Message';
import update from 'immutability-helper';

import ControlWrapper from './ControlWrapper';
import { getUnifiedConfigs } from '../util/util';
import Validator, { SaveValidator } from '../util/Validator';
import { MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../constants/modes';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import InputRowContext from '../context/InputRowContext';

class BaseFormView extends PureComponent{

    static contextType=InputRowContext; 

    constructor(props,context) {
        super(props);

        // flag for to render hook method for once
        this.flag = true;
        this.state = {};
        const globalConfig = getUnifiedConfigs();
        this.appName = globalConfig.meta.name;
        this.endpoint = props.mode === MODE_EDIT ? `${this.props.serviceName}/${this.props.stanzaName}` : `${this.props.serviceName}` ;

        this.util = {
            SetState: (state) => {
                this.setState(state);
            },
            setErrorFieldMsg:this.setErrorFieldMsg,
            clearAllErrorMsg:this.clearAllErrorMsg
        };

        this.utilControlWrapper = {
            handleChange:this.handleChange,
            addCustomValidator:this.addCustomValidator,
            utilCustomFunctions:this.util
        };



        if (props.isInput) {
            globalConfig.pages.inputs.services.forEach((service) => {
                if (service.name === props.serviceName) {
                    this.entities = service.entity;
                    this.options = service.options;
                    if (service.hook) {
                        this.hookDeferred = this.loadHook(service.hook.src, globalConfig);
                    }
                }
            });

            if(props.mode === MODE_EDIT || props.mode === MODE_CLONE){
                this.currentInput = context.rowData[props.serviceName][props.stanzaName];
            }

        } else {
            globalConfig.pages.tabs.forEach((tab) => {
                if (tab.name === props.serviceName) {
                    this.entities = tab.entity;
                    this.options = tab.options;
                    if (tab.hook) {
                        this.hookDeferred = this.loadHook(tab.hook.src, globalConfig);
                    }
                }
            });
        }
        
        const temState = {};
        this.entities.forEach((e) => {
            const tempEntity = {};

            if (props.mode === MODE_CREATE) {
                tempEntity.value = (typeof e.defaultValue !== "undefined") ? e.defaultValue : null;
                tempEntity.display = (typeof e?.options?.display !== "undefined")?e.options.display:true;
                tempEntity.error = false;
                tempEntity.disabled =false;
                temState[e.field] = tempEntity;
            } 
            else if (props.mode === MODE_EDIT) {
                tempEntity.value = (typeof this.currentInput[e.field] !== "undefined") ? this.currentInput[e.field] : undefined;
                tempEntity.display = (typeof e?.options?.display !== "undefined")?e.options.display:true;
                tempEntity.error = false;
                // eslint-disable-next-line no-nested-ternary
                tempEntity.disabled = e.field === 'name' ? true : ( (typeof e?.options?.disableonEdit !== "undefined") ? e.options.disableonEdit : false);
                temState[e.field] = tempEntity;
            } 
            else if (props.mode === MODE_CLONE){
                tempEntity.value = e.field === 'name' ? '' : this.currentInput[e.field];
                tempEntity.display = (typeof e?.options?.display !== "undefined") ? e.options.display:true;
                tempEntity.error = false;
                tempEntity.disabled =false;
                temState[e.field] = tempEntity;
            }
            else{
                throw new Error('Invalid mode :',props.mode);
            }
        });

        this.dependencyMap = new Map();
        this.entities.forEach(e => {
            const fields = e.options?.dependencies;
            if (fields) {
                fields.forEach(field => {
                    const changeFields = this.dependencyMap.get(field);
                    if (changeFields) {
                        changeFields[e.field] = fields;
                    } else {
                        this.dependencyMap.set(field, {
                            [e.field]: fields
                        });
                    }
                });
            }
        });

        this.state = {
            data:temState,
            ErrorMsg :"",
            WarningMsg: ""
        }

        
        // Hook on create method call
        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onCreate === 'function') {
                    this.hook.onCreate();
                }
            });
        }
    }

    handleSubmit = () => {
        this.props.handleFormSubmit(true,false);
        if (this.hook && typeof this.hook.onSave === 'function') {
            const validationPass = this.hook.onSave();
            if (!validationPass) {
                this.props.handleFormSubmit(false,false);
            }
        }
        const datadict = {};

        Object.keys(this.state.data).forEach((field) => {
            datadict[field] = this.state.data[field].value;
        });

        // Validation of form fields on Submit
        const validator = new Validator(this.entities);
        let error = validator.doValidation(datadict);
        if (error) {
            this.setErrorFieldMsg(error.errorField, error.errorMsg);
        } else if (this.options && this.options.saveValidator) {
            error = SaveValidator(this.options.saveValidator, datadict);
            if (error) {
                this.setErrorMsg(error.errorMsg);
                
            }
        }

        if (error && this.hook && typeof this.hook.onSaveFail === 'function') {
            this.hook.onSaveFail();
            this.props.handleFormSubmit(false,false);
        }
        else if(error){
            this.props.handleFormSubmit(false,false);
        }

        if(!error){
            const params = new URLSearchParams();

            Object.keys(datadict).forEach( (key) => {
                if(datadict[key]){
                params.append(key, datadict[key] );
                }
            });

            if(this.props.mode ===MODE_EDIT){
                params.delete("name");
            }

            axiosCallWrapper({
                serviceName: this.endpoint,
                params,
                customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'post',
                handleError: false
            }).catch((err) => {
                const errorSubmitMsg= this.parseErrorMsg(err?.response?.data?.messages[0]?.text);
                this.setState({ErrorMsg:errorSubmitMsg});
                if (this.hook && typeof this.hook.onSaveFail === 'function') {
                    this.hook.onSaveFail();
                }
                this.props.handleFormSubmit(false,false);
                return Promise.reject(err);
            }).then((response) => {
                
                const val = response?.data?.entry[0];
                const tmpObj ={};
                
                tmpObj[val.name] = {
                    ...val.content,
                    id: val.id,
                    name: val.name,
                    serviceName: this.props.serviceName
                };

                this.context.setRowData( update(this.context.rowData,{[this.props.serviceName]: {$merge : tmpObj}}))
                this.props.handleFormSubmit(false,true);
                
            });
        }
    };

    parseErrorMsg = (msg) => {
        let errorMsg = ''; let regex; let matches;
        try {
            regex = /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+([\s\S]*)"\.\s*See splunkd\.log(\/python.log)? for more details\./;
            matches = regex.exec(msg);
            if (matches && matches[1]) {
                try {
                    const innerMsgJSON = JSON.parse(matches[1]);
                    errorMsg = String(innerMsgJSON.messages[0].text);
                } catch (error) {
                    // eslint-disable-next-line prefer-destructuring
                    errorMsg = matches[1];
                }
            } else {
                errorMsg = msg;
            }
        } catch (err) {
            errorMsg = 'Error in processing the request';
        }
        return errorMsg;
    }
    


    handleChange = (field, targetValue)=> {

        const changes = {} 
        if (this.dependencyMap.has(field)) {
            const value = this.dependencyMap.get(field);
            for (const loadField in value) {

                const data = {};
                let load = true;

                value[loadField].forEach(dependency => {
                    const required = !!this.entities.find(
                        e => {
                            return e.field === dependency;
                        }
                    ).required;

                    const value = dependency == field ? targetValue : this.state.data[dependency]["value"]
                    if (required && !value) {
                        load = false;
                    } else {
                        data[dependency] = value
                    }
                });

                if (load) {
                    changes[loadField] = { dependencyValues: {$set: data } }
                }
            }
            
        }
        changes[field] = { value: {$set: targetValue } }

        const newFields = update(this.state ,{ data: changes } );
        const tempState = this.clearAllErrorMsg(newFields);
        this.setState(tempState);

        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onChange === 'function') {
                    this.hook.onChange(newFields[field]);
                }
            });
        }
    }

    addCustomValidator = (field, validatorFunc) =>{
        const index = this.entities.findIndex(x => x.field ===field);
        const validator = [{"type": "custom", "validatorFunc": validatorFunc }];
        this.entities[index].validators = validator;
    }

    // Set error message to display and set error in perticular field 
    setErrorFieldMsg = (field, msg) =>{
        const newFields = update(this.state ,{ data: { [field] : { error: {$set: true } } } } );
        newFields.ErrorMsg = msg;
        this.setState(newFields);
    }

    // Set error in perticular field
    setErrorField = (field) =>{
        const newFields = update(this.state ,{ data: { [field] : { error: {$set: true } } } } );
        this.setState(newFields);
    }

    // Clear error message
    clearErrorMsg = () =>{
        if(this.state.ErrorMsg){
            const newFields = { ...this.state };
            newFields.ErrorMsg = "";
            this.setState(newFields);
        }
    }

    // Set error message
    setErrorMsg = (msg) =>{
        const newFields = { ...this.state };
        newFields.ErrorMsg = msg;
        this.setState(newFields);
    }

    // Clear error message and errors from fields 
    clearAllErrorMsg = (State) =>{        
        const newFields = State ? { ...State } : {...this.state};
        newFields.ErrorMsg = "";
        const newData = State ? { ...State.data } : {...this.state.data};
        const temData ={}
        Object.keys(newData).forEach( (key) => {
            if(newData[key].error){
                temData[key] =  {...newData[key], error:false};
            }
            else{
                temData[key] = newData[key];
            }
        });
        newFields.data = temData;
        return State ? newFields : null;
    }
    
    // Display error message 
    generateErrorMessage = () => {
        if (this.state.ErrorMsg) {
            return (
                <div>
                    <Message appearance="fill" type="error">
                        {this.state.ErrorMsg}
                    </Message>
                </div>
            )
        }
        return null; 
    }

    generateWarningMessage = () => {
        if (this.state.WarningMsg) {
            return (
                <div>
                    <Message appearance="fill" type="warning">
                        {this.state.WarningMsg}
                    </Message>
                </div>
            )
        }
        return null; 
    }

    // generatesubmitMessage
    loadHook = (module, globalConfig) => {
        const myPromise = new Promise((myResolve) => {
            __non_webpack_require__([`app/${this.appName}/js/build/custom/${module}`], (Hook) => {
                this.hook = new Hook(globalConfig, this.props.serviceName, this.state, this.util);
                myResolve(Hook);
            });
        });
        return myPromise;
    };

    render() {
        // onRender method of Hook
        if (this.flag) {
            if (this.hookDeferred) {
                this.hookDeferred.then(() => {
                    if (typeof this.hook.onRender === 'function') {
                        this.hook.onRender();
                    }
                });
            }

            if (this.props.mode === MODE_EDIT) {
                if (this.hookDeferred) {
                    this.hookDeferred.then(() => {
                        if (typeof this.hook.onCreate === 'function') {
                            this.hook.onEditLoad();
                        }
                    });
                }
            }
            this.flag = false;
        }

        return( 
            <div className="form-horizontal">
            {this.generateWarningMessage()}
            {this.generateErrorMessage()}
            {
                this.entities.map( (e) => {

                    const temState = this.state.data[e.field];
                        
                        return ( <ControlWrapper
                            key={e.field}
                            utilityFuncts={this.utilControlWrapper}
                            value={temState.value}
                            display={temState.display}
                            error={temState.error}
                            entity={e}
                            serviceName={this.props.serviceName}
                            mode={this.props.mode}
                            disabled={temState.disabled}
                            dependencyValues={temState.dependencyValues || null}
                        />)
                    
                })
            }
            </div>
        );
    }
}

BaseFormView.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string,
    stanzaName: PropTypes.string,
    mode: PropTypes.string,
    handleFormSubmit: PropTypes.func
};

export default BaseFormView;
