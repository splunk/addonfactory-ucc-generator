import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Message from '@splunk/react-ui/Message';
import update from 'immutability-helper';
import CustomControl from './CustomControl';
import ControlWrapper from './ControlWrapper';
import { getUnifiedConfigs } from '../util/util';

class BaseFormView extends Component {
    constructor(props) {
        super(props);

        // flag for to render hook method for once
        this.flag = true;
        this.state = {};
        const globalConfig = getUnifiedConfigs();
        this.appName = globalConfig.meta.name;

        this.util = {
            SetState: (state) => {
                this.setState(state);
            },
        };

        if (props.isInput) {
            globalConfig.pages.inputs.services.forEach((service) => {
                if (service.name === props.serviceName) {
                    this.entities = service.entity;
                    if (service.hook) {
                        this.hookDeferred = this.loadHook(service.hook.src, globalConfig);
                    }
                }
            });
        } else {
            globalConfig.pages.tabs.forEach((tab) => {
                if (tab.name === props.serviceName) {
                    this.entities = tab.entity;
                    if (tab.hook) {
                        this.hookDeferred = this.loadHook(tab.hook.src, globalConfig);
                    }
                }
            });
        }
        
        const temState = {};
        this.entities.forEach((e) => {
            const tempEntity = {};

            if (props.mode === 'CREATE') {
                tempEntity.value = (typeof e.defaultValue !== "undefined")?e.defaultValue:'';
                tempEntity.display = (typeof e?.options?.display !== "undefined")?e.options.display:true;
                tempEntity.error = false;
                temState[e.field] = tempEntity;
            } else if (props.mode === 'EDIT') {
                tempEntity.value = (typeof props.currentInput[e.field] !== "undefined")? props.currentInput[e.field]:'';
                tempEntity.display = (typeof e?.options?.display !== "undefined")?e.options.display:true;
                tempEntity.error = false;
                temState[e.field] = tempEntity;
            } else {
                tempEntity.value = e.field === 'name' ? '' : props.currentInput[e.field];
                tempEntity.display = (typeof e?.options?.display !== "undefined")?e.options.display:true;
                tempEntity.error = false;
                temState[e.field] = tempEntity;
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

    handleRemove = () => {
        // function to remove data from backend
    };

    handleSubmit = () => {
        if (this.hook && typeof this.hook.onSave === 'function') {
            const validationPass = this.hook.onSave();
            if (!validationPass) {
                return false;
            }
        }
        // To DO :here We will validate data, save data to global state and also to backend
        const saveSuccess = true;
        const dataValues = {};

        const returnValue = {
            result: saveSuccess,
            data: dataValues,
        };

        if (saveSuccess) {
            if (this.hook && typeof this.hook.onSaveSuccess === 'function') {
                this.hook.onSaveSuccess();
            }
            return returnValue;
        }

        if (this.hook && typeof this.hook.onSaveFail === 'function') {
            this.hook.onSaveFail();
        }
        return returnValue;
    };
    

    handleChange = (field, targetValue)=> {
        this.clearErrorMsg();
        const newFields = update(this.state ,{ data: { [field] : { value: {$set: targetValue } } } } );
        this.setState(newFields);

        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onChange === 'function') {
                    this.hook.onChange(newFields[field]);
                }
            });
        }
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
                const tem = {...newData[key]}
                tem.error = false;
                temData[key] = tem;
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
                <div className="msg msg-err" >
                    <Message appearance="fill" type="error">
                        {this.state.ErrorMsg}
                    </Message>
                </div>
            )
        }
        return null; 
    }

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

            if (this.props.mode === 'EDIT') {
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

        const rows = [];

        this.entities.forEach( (e) => {
            if (e.type === 'custom') {
                rows.push(
                    <CustomControl
                        key={e.field}
                        handleChange={this.handleChange}
                        display={this.state.data[e.field].display}
                        error={this.state.data[e.field].error}
                        field={e.field}
                        helptext={e.help}
                        label={e.label}
                        controlOptions={e.options}
                        mode={this.props.mode}
                    />
                );
            } else {
                rows.push(
                    <ControlWrapper
                        key={e.field}
                        handleChange={this.handleChange}
                        value={this.state.data[e.field].value}
                        display={this.state.data[e.field].display}
                        error={this.state.data[e.field].error}
                        helptext={e.help || ""}
                        label={e.label}
                        field={e.field}
                        controlOptions={ e.options|| {} }
                        mode={this.props.mode}
                        tooltip={e.tooltip || ""}
                        type={e.type}
                    />
                );
            }
        });

        return( <div className="form-horizontal">
            {this.generateErrorMessage()}
            {rows}
            </div>
        );
    }
}

BaseFormView.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string,
    mode: PropTypes.string,
    currentInput: PropTypes.object,
};

export default BaseFormView;
