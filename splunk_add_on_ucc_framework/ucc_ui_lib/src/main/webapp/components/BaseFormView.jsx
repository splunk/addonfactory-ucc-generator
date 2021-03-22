import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Message from '@splunk/react-ui/Message';

import ControlWrapper from './ControlWrapper';
import { getUnifiedConfigs } from '../util/util';
import Validator, { SaveValidator } from '../util/Validator';
import { MODE_CLONE, MODE_CREATE, MODE_EDIT, MODE_CONFIG } from '../constants/modes';
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
            props.mode === MODE_EDIT
                ? `${this.props.serviceName}/${this.props.stanzaName}`
                : `${this.props.serviceName}`;

        this.util = {
            setState: (state) => {
                this.setState(state);
            },
            setErrorFieldMsg: this.setErrorFieldMsg,
            clearAllErrorMsg: this.clearAllErrorMsg,
        };

        this.utilControlWrapper = {
            handleChange: this.handleChange,
            addCustomValidator: this.addCustomValidator,
            utilCustomFunctions: this.util,
        };

        if (props.page === 'inputs') {
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
            e.defaultValue = e.defaultValue ? e.defaultValue : '';

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
                // eslint-disable-next-line no-nested-ternary
                tempEntity.disabled =
                    e.field === 'name'
                        ? true
                        : typeof e?.options?.disableonEdit !== 'undefined'
                        ? e.options.disableonEdit
                        : false;
                temState[e.field] = tempEntity;
            } else if (props.mode === MODE_CLONE) {
                tempEntity.value = e.field === 'name' ? '' : this.currentInput[e.field];
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                tempEntity.disabled = false;
                temState[e.field] = tempEntity;
            } else if (props.mode === MODE_CONFIG) {
                tempEntity.value =
                    typeof this.currentInput[e.field] !== 'undefined'
                        ? this.currentInput[e.field]
                        : e.defaultValue;
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                tempEntity.error = false;
                // eslint-disable-next-line no-nested-ternary
                tempEntity.disabled =
                    e.field === 'name'
                        ? true
                        : typeof e?.options?.disableonEdit !== 'undefined'
                        ? e.options.disableonEdit
                        : false;
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

    // componentDidMount() {
    //     if(this.props.page === "configuration"){
    //         axiosCallWrapper({
    //             serviceName: this.endpoint,
    //             handleError: true,
    //             callbackOnError: (error) => {
    //                 error.uccErrorCode = 'ERR0004';
    //                 this.setState({error});
    //             },
    //         }).then((response) => {
    //             setCurrentServiceState(response.data.entry[0].content);
    //         });
    //     }
    // }

    handleSubmit = () => {
        this.props.handleFormSubmit(true, false);
        if (this.hook && typeof this.hook.onSave === 'function') {
            const validationPass = this.hook.onSave();
            if (!validationPass) {
                this.props.handleFormSubmit(false, false);
            }
        }
        const datadict = {};

        Object.keys(this.state.data).forEach((field) => {
            datadict[field] = this.state.data[field].value;
        });
        console.log(datadict);
        console.log(this.entities);

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
            this.props.handleFormSubmit(false, false);
        } else if (error) {
            this.props.handleFormSubmit(false, false);
        }

        if (!error) {
            const params = new URLSearchParams();

            Object.keys(datadict).forEach((key) => {
                if (datadict[key]) {
                    params.append(key, datadict[key]);
                }
            });

            if (this.props.mode === MODE_EDIT) {
                params.delete('name');
            }

            axiosCallWrapper({
                serviceName: this.endpoint,
                params,
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
                    this.props.handleFormSubmit(false, false);
                    return Promise.reject(err);
                })
                .then((response) => {
                    const val = response?.data?.entry[0];
                    const tmpObj = {};

                    tmpObj[val.name] = {
                        ...val.content,
                        id: val.id,
                        name: val.name,
                        serviceName: this.props.serviceName,
                    };
                    if (this.props.mode !== MODE_CONFIG) {
                        this.context.setRowData(
                            update(this.context.rowData, {
                                [this.props.serviceName]: { $merge: tmpObj },
                            })
                        );
                    }
                    this.props.handleFormSubmit(false, true);
                });
        }
    };

    handleChange = (field, targetValue) => {
        const changes = {};
        if (this.dependencyMap.has(field)) {
            const value = this.dependencyMap.get(field);
            for (const loadField in value) {
                const data = {};
                let load = true;

                value[loadField].forEach((dependency) => {
                    const required = !!this.entities.find((e) => {
                        return e.field === dependency;
                    }).required;

                    const value =
                        dependency == field ? targetValue : this.state.data[dependency]['value'];
                    if (required && !value) {
                        load = false;
                    } else {
                        data[dependency] = value;
                    }
                });

                if (load) {
                    changes[loadField] = { dependencyValues: { $set: data } };
                }
            }
        }
        changes[field] = { value: { $set: targetValue } };

        const newFields = update(this.state, { data: changes });
        const tempState = this.clearAllErrorMsg(newFields);
        this.setState(tempState);

        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onChange === 'function') {
                    this.hook.onChange(newFields[field]);
                }
            });
        }
    };

    addCustomValidator = (field, validatorFunc) => {
        const index = this.entities.findIndex((x) => x.field === field);
        const validator = [{ type: 'custom', validatorFunc: validatorFunc }];
        this.entities[index].validators = validator;
    };

    // Set error message to display and set error in perticular field
    setErrorFieldMsg = (field, msg) => {
        const newFields = update(this.state, { data: { [field]: { error: { $set: true } } } });
        newFields.errorMsg = msg;
        this.setState(newFields);
    };

    // Set error in perticular field
    setErrorField = (field) => {
        const newFields = update(this.state, { data: { [field]: { error: { $set: true } } } });
        this.setState(newFields);
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
        const newFields = { ...this.state };
        newFields.errorMsg = msg;
        this.setState(newFields);
    };

    // Clear error message and errors from fields
    clearAllErrorMsg = (State) => {
        const newFields = State ? { ...State } : { ...this.state };
        newFields.errorMsg = '';
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

        return (
            <div
                className="form-horizontal"
                style={this.props.page === 'configuration' ? { marginTop: '10px' } : {}}
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
