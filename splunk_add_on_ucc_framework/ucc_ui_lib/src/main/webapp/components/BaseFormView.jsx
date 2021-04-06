import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Message from '@splunk/react-ui/Message';

import ControlWrapper from './ControlWrapper';
import { getUnifiedConfigs } from '../util/util';
import Validator, { SaveValidator } from '../util/Validator';
import { MODE_CLONE, MODE_CREATE, MODE_EDIT, MODE_CONFIG } from '../constants/modes';
import { PAGE_INPUT } from '../constants/pages';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import TableContext from '../context/TableContext';
import { parseErrorMsg } from '../util/messageUtil';

class BaseFormView extends PureComponent {
    static contextType = TableContext;

    constructor(props, context) {
        super(props);
        // flag for to render hook method for once
        this.flag = true;
        this.state = {};
        this.currentInput = {};
        const globalConfig = getUnifiedConfigs();
        this.appName = globalConfig.meta.name;
        this.endpoint =
            props.mode === MODE_EDIT || props.mode === MODE_CONFIG
                ? `${this.props.serviceName}/${this.props.stanzaName}`
                : `${this.props.serviceName}`;

        this.util = {
            setState: (callback) => {
                this.setState(previousState => {
                    return callback(previousState)
                  })
            },
            setErrorFieldMsg: this.setErrorFieldMsg,
            clearAllErrorMsg: this.clearAllErrorMsg,
        };

        this.utilControlWrapper = {
            handleChange: this.handleChange,
            addCustomValidator: this.addCustomValidator,
            utilCustomFunctions: this.util,
        };

        if (props.page === PAGE_INPUT) {
            globalConfig.pages.inputs.services.forEach((service) => {
                if (service.name === props.serviceName) {
                    this.entities = service.entity;
                    this.options = service.options;
                    if (service.hook) {
                        this.hookDeferred = this.loadHook(service.hook.src, globalConfig);
                    }
                    if (props.mode === MODE_EDIT || props.mode === MODE_CLONE) {
                        this.currentInput = context.rowData[props.serviceName][props.stanzaName];
                    }
                }
            });
        } else {
            globalConfig.pages.configuration.tabs.forEach((tab) => {
                const flag = tab.table
                    ? tab.name === props.serviceName
                    : tab.name === props.stanzaName;
                if (flag) {
                    this.entities = tab.entity;
                    this.options = tab.options;
                    if (tab.hook) {
                        this.hookDeferred = this.loadHook(tab.hook.src, globalConfig);
                    }
                    if (tab.table && (props.mode === MODE_EDIT || props.mode === MODE_CLONE)) {
                        this.currentInput = context.rowData[props.serviceName][props.stanzaName];
                    } else if (props.mode === MODE_CONFIG) {
                        this.currentInput = props.currentServiceState;
                    } else {
                        this.currentInput = context.rowData[props.serviceName];
                    }
                }
            });
        }

        const temState = {};
        this.entities.forEach((e) => {
            const tempEntity = {};

            if (props.mode === MODE_CREATE) {
                tempEntity.value = typeof e.defaultValue !== 'undefined' ? e.defaultValue : null;
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                tempEntity.disabled = false;
                temState[e.field] = tempEntity;
            } else if (props.mode === MODE_EDIT) {
                tempEntity.value =
                    typeof this.currentInput[e.field] !== 'undefined'
                        ? this.currentInput[e.field]
                        : null;

                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                tempEntity.disabled = false;
                if (e.field === 'name') {
                    tempEntity.disabled = true;
                } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                    tempEntity.disabled = e.options.disableonEdit;
                }
                temState[e.field] = tempEntity;
            } else if (props.mode === MODE_CLONE) {
                tempEntity.value = e.field === 'name' ? '' : this.currentInput[e.field];
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                tempEntity.disabled = false;
                temState[e.field] = tempEntity;
            } else if (props.mode === MODE_CONFIG) {
                e.defaultValue = typeof e.defaultValue !== 'undefined' ? e.defaultValue : null;
                tempEntity.value =
                    typeof this.currentInput[e.field] !== 'undefined'
                        ? this.currentInput[e.field]
                        : e.defaultValue;
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                tempEntity.disabled = false;
                if (e.field === 'name') {
                    tempEntity.disabled = true;
                } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                    tempEntity.disabled = e.options.disableonEdit;
                }
                temState[e.field] = tempEntity;
            } else {
                throw new Error('Invalid mode :', props.mode);
            }
        });

        this.dependencyMap = new Map();
        this.entities.forEach((e) => {
            const fields = e.options?.dependencies;
            if (fields) {
                fields.forEach((field) => {
                    const changeFields = this.dependencyMap.get(field);
                    if (changeFields) {
                        changeFields[e.field] = fields;
                    } else {
                        this.dependencyMap.set(field, {
                            [e.field]: fields,
                        });
                    }
                });
            }
        });

        this.state = {
            data: temState,
            errorMsg: '',
            warningMsg: '',
        };

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
        this.props.handleFormSubmit(/* isSubmititng */true, /* closeEntity */false);
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
        if (!error && this.hook && typeof this.hook.onSave === 'function') {
            const validationPass = this.hook.onSave(datadict);
            if (!validationPass) {
                this.props.handleFormSubmit(/* isSubmititng */false,/* closeEntity */ false);
            }
        }

        if (error) {
            this.props.handleFormSubmit(/* isSubmititng */false,/* closeEntity */ false);
        }
        else{
            const body = new URLSearchParams();

            Object.keys(datadict).forEach((key) => {
                if (datadict[key] != null) {
                    body.append(key, datadict[key]);
                }
            });

            if (this.props.mode === MODE_EDIT) {
                body.delete('name');
            }

            axiosCallWrapper({
                serviceName: this.endpoint,
                body,
                customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'post',
                handleError: false,
            })
                .catch((err) => {
                    const errorSubmitMsg = parseErrorMsg(err?.response?.data?.messages[0]?.text);
                    this.setState({ errorMsg: errorSubmitMsg });
                    if (this.hook && typeof this.hook.onSaveFail === 'function') {
                        this.hook.onSaveFail();
                    }
                    this.props.handleFormSubmit(/* isSubmititng */false,/* closeEntity */  false);
                    return Promise.reject(err);
                })
                .then((response) => {
                    const val = response?.data?.entry[0];
                    if (this.props.mode !== MODE_CONFIG) {
                        const tmpObj = {};

                        tmpObj[val.name] = {
                            ...val.content,
                            id: val.id,
                            name: val.name,
                            serviceName: this.props.serviceName,
                        };

                        this.context.setRowData(
                            update(this.context.rowData, {
                                [this.props.serviceName]: { $merge: tmpObj },
                            })
                        );
                    }
                    if (this.hook && typeof this.hook.onSaveSuccess === 'function') {
                        this.hook.onSaveSuccess();
                    }
                    this.props.handleFormSubmit(/* isSubmititng */false,/* closeEntity */  true);
                });
        }
    };

    handleChange = (field, targetValue) => {
        const changes = {};
        if (this.dependencyMap.has(field)) {
            const value = this.dependencyMap.get(field);
            Object.keys(value).forEach((loadField) => {
                const data = {};
                let load = true;

                value[loadField].forEach((dependency) => {
                    const required = !!this.entities.find((e) => {
                        return e.field === dependency;
                    }).required;

                    const currentValue =
                        dependency === field ? targetValue : this.state.data[dependency].value;
                    if (required && !currentValue) {
                        load = false;
                        data[dependency] = null;
                    } else {
                        data[dependency] = currentValue;
                    }
                });

                if (load) {
                    changes[loadField] = {
                        dependencyValues: { $set: data },
                        value: { $set: null },
                    };
                }
            });
        }
        changes[field] = { value: { $set: targetValue } };

        const newFields = update(this.state, { data: changes });
        const tempState = this.clearAllErrorMsg(newFields);
        this.setState(tempState);

        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onChange === 'function') {
                    this.hook.onChange(field, targetValue);
                }
            });
        }
    };

    addCustomValidator = (field, validatorFunc) => {
        const index = this.entities.findIndex((x) => x.field === field);
        const validator = [{ type: 'custom', validatorFunc }];
        this.entities[index].validators = validator;
    };

    // Set error message to display and set error in perticular field
    setErrorFieldMsg = (field, msg) => {
        this.setState(previousState => {
            const newFields = update(previousState, { data: { [field]: { error: { $set: true } } } });
            newFields.errorMsg = msg;
            return newFields;
        })
    };

    // Set error in perticular field
    setErrorField = (field) => {
        this.setState(previousState => {
            return update(previousState, { data: { [field]: { error: { $set: true } } } });
        })
    };

    // Clear error message
    clearErrorMsg = () => {
        if (this.state.errorMsg) {
            const newFields = { ...this.state };
            newFields.errorMsg = '';
            this.setState(newFields);
        }
    };

    // Set error message
    setErrorMsg = (msg) => {
        this.setState(previousState => {
            return {...previousState, errorMsg:msg};
        })
    };

    // Clear error/warning message and errors from fields
    clearAllErrorMsg = (State) => {
        const newFields = State ? { ...State } : { ...this.state };
        newFields.errorMsg = '';
        newFields.warningMsg = '';
        const newData = State ? { ...State.data } : { ...this.state.data };
        const temData = {};
        Object.keys(newData).forEach((key) => {
            if (newData[key].error) {
                temData[key] = { ...newData[key], error: false };
            } else {
                temData[key] = newData[key];
            }
        });
        newFields.data = temData;
        return State ? newFields : null;
    };

    // Display error message
    generateErrorMessage = () => {
        if (this.state.errorMsg) {
            return (
                <Message appearance="fill" type="error">
                    {this.state.errorMsg}
                </Message>
            );
        }
        return null;
    };

    generateWarningMessage = () => {
        if (this.state.warningMsg) {
            return (
                <Message appearance="fill" type="warning">
                    {this.state.warningMsg}
                </Message>
            );
        }
        return null;
    };

    // generatesubmitMessage
    loadHook = (module, globalConfig) => {
        const myPromise = new Promise((myResolve) => {
            __non_webpack_require__([`app/${this.appName}/js/build/custom/${module}`], (Hook) => {
                this.hook = new Hook(globalConfig, this.props.serviceName, this.state, this.props.mode, this.util);
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
                        if (typeof this.hook.onEditLoad === 'function') {
                            this.hook.onEditLoad();
                        }
                    });
                }
            }
            this.flag = false;
        }

        return (
            <div
                className="form-horizontal"
                style={this.props.mode === MODE_CONFIG ? { marginTop: '10px' } : {}}
            >
                {this.generateWarningMessage()}
                {this.generateErrorMessage()}
                {this.entities.map((e) => {
                    const temState = this.state.data[e.field];

                    return (
                        <ControlWrapper
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
                        />
                    );
                })}
            </div>
        );
    }
}

BaseFormView.propTypes = {
    page: PropTypes.string,
    serviceName: PropTypes.string,
    stanzaName: PropTypes.string,
    currentServiceState: PropTypes.object,
    mode: PropTypes.string,
    handleFormSubmit: PropTypes.func,
};

export default BaseFormView;
