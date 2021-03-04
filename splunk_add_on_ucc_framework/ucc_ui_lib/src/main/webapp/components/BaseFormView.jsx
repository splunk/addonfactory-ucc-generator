import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

        const temState = [];
        this.entities.forEach((e) => {
            const tempEntity = {};

            if (props.mode === 'CREATE') {
                tempEntity.value = e.defaultValue || '';
                tempEntity.display = e.options.display || true;
                tempEntity.error = false;
                temState.push(tempEntity);
            } else if (props.mode === 'EDIT') {
                tempEntity.value = props.currentInput[e.field] || '';
                tempEntity.display = e.options.display || true;
                tempEntity.error = false;
                temState.push(tempEntity);
            } else {
                tempEntity.value = e.field === 'name' ? '' : props.currentInput[e.field];
                tempEntity.display = e.options.display || true;
                tempEntity.error = false;
                temState.push(tempEntity);
            }
        });

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
        // here We will validate data, save data to global state and also to backend
        const saveSuccess = true;
        const dataValues = {};

        const retunValue = {
            result: saveSuccess,
            data: dataValues,
        };

        if (saveSuccess) {
            if (this.hook && typeof this.hook.onSaveSuccess === 'function') {
                this.hook.onSaveSuccess();
            }
            return retunValue;
        }

        if (this.hook && typeof this.hook.onSaveFail === 'function') {
            this.hook.onSaveFail();
        }
        return retunValue;
    };

    handleChange(fieldId, targetValue) {
        const newFields = { ...this.state };
        newFields[fieldId].value = targetValue;
        this.setState(newFields);

        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onChange === 'function') {
                    this.hook.onChange(newFields[fieldId]);
                }
            });
        }
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

        this.entities.forEach( (e, index) => {
            if (e.type === 'custom') {
                rows.push(
                    <CustomControl
                        id={index}
                        key={e.field}
                        handleChange={this.handleChange}
                        display={this.state[index].display}
                        error={this.state[index].error}
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
                        id={index}
                        handleChange={this.handleChange}
                        value={this.state[index].value}
                        display={this.state[index].display}
                        error={this.state[index].error}
                        helptext={e.help || ""}
                        label={e.label}
                        field={e.field}
                        controlOptions={ e.options|| {} }
                        mode={this.props.mode}
                        tooltip={e.tooltip || ""}
                    />
                );
            }
        });

        return <div>{rows}</div>;
    }
}

BaseFormView.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string,
    mode: PropTypes.string,
    currentInput: PropTypes.object,
};

export default BaseFormView;
