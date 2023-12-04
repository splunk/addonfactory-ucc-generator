import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';

import Message from '@splunk/react-ui/Message';

import ControlWrapper from './ControlWrapper';
import Validator, { SaveValidator } from '../util/Validator';
import { getUnifiedConfigs, generateToast } from '../util/util';
import { MODE_CLONE, MODE_CREATE, MODE_EDIT, MODE_CONFIG } from '../constants/modes';
import { PAGE_INPUT, PAGE_CONF } from '../constants/pages';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { parseErrorMsg, getFormattedMessage } from '../util/messageUtil';
import { getBuildDirPath } from '../util/script';

import {
    ERROR_REQUEST_TIMEOUT_TRY_AGAIN,
    ERROR_REQUEST_TIMEOUT_ACCESS_TOKEN_TRY_AGAIN,
    ERROR_OCCURRED_TRY_AGAIN,
    ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN,
    ERROR_STATE_MISSING_TRY_AGAIN,
} from '../constants/oAuthErrorMessage';
import TableContext from '../context/TableContext';
import Group from './Group';

function onCustomHookError(params) {
    // eslint-disable-next-line no-console
    console.error(
        `[Custom Hook] Something went wrong while calling ${params.methodName}. Error: ${params.error?.name} ${params.error?.message}`
    );
}

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
        this.groupEntities = [];
        this.endpoint =
            props.mode === MODE_EDIT || props.mode === MODE_CONFIG
                ? `${this.props.serviceName}/${encodeURIComponent(this.props.stanzaName)}`
                : `${this.props.serviceName}`;

        this.util = {
            setState: (callback) => {
                this.onSavePromise = new Promise((resolve) => {
                    this.setState((previousState) => callback(previousState), resolve);
                });
            },
            setErrorFieldMsg: this.setErrorFieldMsg,
            clearAllErrorMsg: this.clearAllErrorMsg,
            setErrorMsg: this.setErrorMsg,
        };

        this.utilControlWrapper = {
            handleChange: this.handleChange,
            addCustomValidator: this.addCustomValidator,
            utilCustomFunctions: this.util,
        };

        if (props.page === PAGE_INPUT) {
            globalConfig.pages.inputs.services.forEach((service) => {
                if (service.name === props.serviceName) {
                    this.groups = service.groups;
                    this.entities = service.entity;
                    this.updateGroupEntities();
                    this.options = service.options;
                    if (service.hook) {
                        this.hookDeferred = this.loadHook(
                            service.hook.src,
                            service.hook.type,
                            globalConfig
                        );
                    }
                    if (props.mode === MODE_EDIT || props.mode === MODE_CLONE) {
                        this.currentInput =
                            context?.rowData?.[props.serviceName]?.[props.stanzaName];
                    }
                }
            });
        } else {
            globalConfig.pages.configuration.tabs.forEach((tab) => {
                const flag = tab.table
                    ? tab.name === props.serviceName
                    : tab.name === props.stanzaName && props.serviceName === 'settings';
                if (flag) {
                    this.entities = tab.entity;
                    this.options = tab.options;
                    if (tab.hook) {
                        this.hookDeferred = this.loadHook(
                            tab.hook.src,
                            tab.hook.type,
                            globalConfig
                        );
                    }
                    if (tab.table && (props.mode === MODE_EDIT || props.mode === MODE_CLONE)) {
                        this.currentInput =
                            context?.rowData?.[props.serviceName]?.[props.stanzaName];
                    } else if (props.mode === MODE_CONFIG) {
                        this.currentInput = props.currentServiceState;
                        this.mode_config_title = tab.title;
                    } else {
                        this.currentInput = context?.rowData?.[props.serviceName];
                    }
                }
            });
        }
        this.dependencyMap = new Map();
        this.isOAuth = false;
        this.isAuthVal = false;
        this.authMap = {};
        let temState = {};
        const temEntities = [];

        this.entities.forEach((e) => {
            if (e.type === 'oauth') {
                this.isOAuth = true;
                if (props.page === PAGE_CONF && props.serviceName === 'account') {
                    const authType = e?.options?.auth_type;
                    this.isoauthState =
                        typeof e?.options?.oauth_state_enabled !== 'undefined'
                            ? e?.options?.oauth_state_enabled
                            : null;

                    if (authType.length > 1) {
                        this.isAuthVal = true;
                        // Defining state for auth_type in case of multiple Authentication
                        const tempEntity = {};
                        tempEntity.value =
                            typeof this.currentInput?.auth_type !== 'undefined'
                                ? this.currentInput?.auth_type
                                : authType[0];
                        tempEntity.display = true;
                        tempEntity.error = false;
                        tempEntity.disabled = false;
                        temState.auth_type = tempEntity;

                        // Defining Entity for auth_type in entitylist of globalConfig
                        const entity = {};
                        entity.field = 'auth_type';
                        entity.type = 'singleSelect';
                        entity.label = 'Auth Type';
                        const content = {
                            basic: 'Basic Authentication',
                            oauth: 'OAuth 2.0 Authentication',
                        };
                        entity.options = {};
                        entity.options.hideClearBtn = true;
                        entity.options.autoCompleteFields = authType.map((type) => ({
                            label: content[type],
                            value: type,
                        }));
                        temEntities.push(entity);
                    } else {
                        this.isSingleOauth = authType.includes('oauth');
                    }

                    // Adding State and Entity(in entitylist) for every Fields of "oauth" type
                    // Iterating over everytype of Authentication under "oauth" type
                    authType.forEach((type) => {
                        const authfields = [];
                        const fields = e?.options[type];
                        if (fields) {
                            // For Particaular type iterating over fields
                            fields.forEach((field) => {
                                // every field for auth type
                                const tempEntity = {};

                                if (props.mode === MODE_CREATE) {
                                    tempEntity.value =
                                        typeof field?.defaultValue !== 'undefined'
                                            ? field.defaultValue
                                            : null;
                                } else {
                                    const isEncrypted =
                                        typeof field?.encrypted !== 'undefined'
                                            ? field?.encrypted
                                            : false;
                                    tempEntity.value = isEncrypted
                                        ? ''
                                        : this.currentInput?.[field.field];
                                }
                                tempEntity.display =
                                    typeof temState.auth_type !== 'undefined'
                                        ? type === temState.auth_type.value
                                        : true;
                                tempEntity.error = false;

                                tempEntity.disabled = !field.options.enable === false;

                                if (props.mode === MODE_EDIT) {
                                    // .disableonEdit = false do not overwrite .disabled = true
                                    tempEntity.disabled =
                                        field?.options?.disableonEdit === true ||
                                        tempEntity.disabled;
                                }

                                temState[field.field] = tempEntity;
                                // eslint-disable-next-line no-param-reassign
                                field.type =
                                    typeof field?.type !== 'undefined' ? field.type : 'text';

                                // Handled special case for redirect_url
                                if (field.field === 'redirect_url') {
                                    tempEntity.value = window.location.href
                                        .split('?')[0]
                                        .replace(
                                            'configuration',
                                            `${this.appName.toLowerCase()}_redirect`
                                        );
                                    tempEntity.disabled = true;
                                }
                                temEntities.push(field);
                                authfields.push(field.field);
                            });
                            this.authMap[type] = authfields;
                        }
                    });
                    if (authType.includes('oauth')) {
                        const oauthConfData = {};
                        // Storing O-Auth Configuration data to class variable to use later
                        oauthConfData.popupWidth = e.options.oauth_popup_width
                            ? e.options.oauth_popup_width
                            : 600;
                        oauthConfData.popupHeight = e.options.oauth_popup_height
                            ? e.options.oauth_popup_height
                            : 600;
                        oauthConfData.authTimeout = e.options.oauth_timeout
                            ? e.options.oauth_timeout
                            : 180;
                        oauthConfData.authCodeEndpoint = e.options.auth_code_endpoint
                            ? e.options.auth_code_endpoint
                            : null;
                        oauthConfData.accessTokenEndpoint = e.options.access_token_endpoint
                            ? e.options.access_token_endpoint
                            : null;
                        oauthConfData.authEndpointAccessTokenType = e.options
                            .auth_endpoint_token_access_type
                            ? e.options.auth_endpoint_token_access_type
                            : null;
                        this.oauthConf = oauthConfData;
                    }
                }
            } else {
                const tempEntity = {};
                e.encrypted = typeof e.encrypted !== 'undefined' ? e.encrypted : false;

                if (e.type === 'file' && this.currentInput?.[e.field]) {
                    /*
                     adding example name to enable possibility of removal file,
                     not forcing value addition as if value is encrypted it is shared as
                     string ie. ***** and it is considered a valid default value
                     if value is not encrypted it is pushed correctly along with this name
                    */
                    tempEntity.fileNameToDisplay = 'Previous File';
                }

                if (props.mode === MODE_CREATE) {
                    tempEntity.value =
                        typeof e.defaultValue !== 'undefined' ? e.defaultValue : null;
                    tempEntity.display =
                        typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                    tempEntity.error = false;
                    tempEntity.disabled = e?.options?.enable === false;
                    temState[e.field] = tempEntity;
                } else if (props.mode === MODE_EDIT) {
                    tempEntity.value =
                        typeof this.currentInput?.[e.field] !== 'undefined'
                            ? this.currentInput?.[e.field]
                            : null;
                    tempEntity.value = e.encrypted ? '' : tempEntity.value;
                    tempEntity.display =
                        typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                    tempEntity.error = false;
                    tempEntity.disabled = e?.options?.enable === false;
                    if (e.field === 'name') {
                        tempEntity.disabled = true;
                    } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                        tempEntity.disabled = e.options.disableonEdit;
                    }
                    temState[e.field] = tempEntity;
                } else if (props.mode === MODE_CLONE) {
                    tempEntity.value =
                        e.field === 'name' || e.encrypted ? '' : this.currentInput?.[e.field];
                    tempEntity.display =
                        typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                    tempEntity.error = false;
                    tempEntity.disabled = e?.options?.enable === false;
                    temState[e.field] = tempEntity;
                } else if (props.mode === MODE_CONFIG) {
                    e.defaultValue = typeof e.defaultValue !== 'undefined' ? e.defaultValue : null;
                    tempEntity.value =
                        typeof this.currentInput?.[e.field] !== 'undefined'
                            ? this.currentInput?.[e.field]
                            : e.defaultValue;
                    tempEntity.value = e.encrypted ? '' : tempEntity.value;
                    tempEntity.display =
                        typeof e?.options?.display !== 'undefined' ? e.options.display : true;
                    tempEntity.error = false;
                    tempEntity.disabled = e?.options?.enable === false;
                    if (e.field === 'name') {
                        tempEntity.disabled = true;
                    } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                        tempEntity.disabled = e.options.disableonEdit;
                    }
                    temState[e.field] = tempEntity;
                } else {
                    throw new Error('Invalid mode :', props.mode);
                }

                // handle dependent fields
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
                temEntities.push(e);
            }
        });

        this.entities = temEntities;

        // flatten the dependencyMap to remove redundant iterations for resolving them
        // one-by-one in following loop
        let flattenedMap = {};
        this.dependencyMap.forEach((value) => {
            flattenedMap = { ...flattenedMap, ...value };
        });

        const changes = {};
        Object.keys(flattenedMap).forEach((field) => {
            const values = flattenedMap[field];
            const data = {};
            let load = true;

            values.forEach((dependency) => {
                const required = !!this.entities.find((e) => e.field === dependency).required;

                const currentValue = temState[dependency].value;
                if (required && !currentValue) {
                    load = false;
                    data[dependency] = null;
                } else {
                    data[dependency] = currentValue;
                }
            });

            if (load) {
                changes[field] = {
                    dependencyValues: { $set: data },
                };
            }
        });

        // apply dependency field changes in state
        temState = update(temState, changes);
        this.state = {
            data: temState,
            errorMsg: '',
            warningMsg: '',
        };

        // Hook on create method call
        if (this.hookDeferred) {
            this.hookDeferred.then(() => {
                if (typeof this.hook.onCreate === 'function') {
                    try {
                        this.hook.onCreate();
                    } catch (error) {
                        onCustomHookError({ methodName: 'onCreate', error });
                    }
                }
            });
        }
    }

    updateGroupEntities = () => {
        if (this.groups) {
            this.groups.forEach((group) => {
                group.fields.forEach((fieldName) => this.groupEntities.push(fieldName));
            });
        }
    };

    // eslint-disable-next-line react/no-unused-class-component-methods
    handleSubmit = () => {
        this.clearErrorMsg();
        this.props.handleFormSubmit(/* isSubmitting */ true, /* closeEntity */ false);

        this.datadict = {};

        Object.keys(this.state.data).forEach((field) => {
            this.datadict[field] = this.state.data[field].value;
        });

        if (this.hook && typeof this.hook.onSave === 'function') {
            const validationPass = this.hook.onSave(this.datadict);
            if (!validationPass) {
                this.props.handleFormSubmit(/* isSubmitting */ false, /* closeEntity */ false);
                return;
            }
        }
        const executeValidationSubmit = () => {
            Object.keys(this.state.data).forEach((field) => {
                this.datadict[field] = this.state.data[field].value;
            });

            // validation for unique name
            if ([MODE_CREATE, MODE_CLONE].includes(this.props.mode)) {
                const isExistingName = Boolean(
                    Object.values(this.context?.rowData).find((val) =>
                        Object.keys(val).find((name) => name === this.datadict.name)
                    )
                );

                if (isExistingName) {
                    const index = this.entities.findIndex((e) => e.field === 'name');
                    this.setErrorFieldMsg(
                        'name',
                        getFormattedMessage(2, [this.entities[index].label, this.datadict.name])
                    );
                    this.props.handleFormSubmit(/* isSubmitting */ false, /* closeEntity */ false);
                    return;
                }
            }

            // validation condition of required fields in O-Auth
            let temEntities;
            if (this.isOAuth) {
                let reqFields = [];
                Object.keys(this.authMap).forEach((type) => {
                    // `isAuthVal` is required in a case where only single auth type is provided
                    if (type === this.datadict.auth_type || !this.isAuthVal) {
                        reqFields = [...reqFields, ...this.authMap[type]];
                    }
                });
                temEntities = this.entities.map((e) => {
                    if (reqFields.includes(e.field)) {
                        // All oauth fields are required except if explicitely `required` is set to `false`
                        return { required: true, ...e };
                    }
                    return e;
                });
            } else {
                temEntities = this.entities;
            }

            // Validation of form fields on Submit
            const validator = new Validator(temEntities);
            let error = validator.doValidation(this.datadict);
            if (error) {
                this.setErrorFieldMsg(error.errorField, error.errorMsg);
            } else if (this.options && this.options.saveValidator) {
                error = SaveValidator(this.options.saveValidator, this.datadict);
                if (error) {
                    this.setErrorMsg(error.errorMsg);
                }
            }

            if (error) {
                this.props.handleFormSubmit(/* isSubmitting */ false, /* closeEntity */ false);
            } else if (
                this.isOAuth &&
                (this.isSingleOauth || (this.isAuthVal && this.datadict.auth_type === 'oauth'))
            ) {
                // handle oauth Authentication
                // Populate the parameter string with client_id, redirect_url and response_type
                let parameters = `?response_type=code&client_id=${this.datadict.client_id}&redirect_uri=${this.datadict.redirect_url}`;
                // Get the value for state_enabled
                const stateEnabled = this.isoauthState != null ? this.isoauthState : false;
                if (stateEnabled === 'true' || stateEnabled === true) {
                    this.state_enabled = true;
                    // Generating a cryptographically strong state parameter, which will be used ONLY during configuration
                    this.oauth_state = uuidv4().replace(/-/g, '');

                    // Appending the state in the headers
                    parameters = `${parameters}&state=${this.oauth_state}`;
                }

                if (this.datadict.scope) {
                    parameters = `${parameters}&scope=${this.datadict.scope}`;
                }

                if (this.oauthConf.authEndpointAccessTokenType) {
                    parameters = `${parameters}&token_access_type=${this.oauthConf.authEndpointAccessTokenType}`;
                }

                let host = encodeURI(
                    `https://${this.datadict.endpoint}${this.oauthConf.authCodeEndpoint}${parameters}`
                );
                const redirectURI = new URLSearchParams(host).get('redirect_uri');
                host = host.replace(redirectURI, encodeURIComponent(redirectURI));

                (async () => {
                    this.isCalled = false;
                    this.isError = false;
                    this.isResponse = false;
                    // Get auth_type element from global config json

                    // Open a popup to make auth request
                    this.childWin = window.open(
                        host,
                        `${this.appName} OAuth`,
                        `width=${this.oauthConf.popupWidth}, height=${this.oauthConf.popupHeight}`
                    );
                    // Callback to receive data from redirect url
                    window.getMessage = (message) => {
                        this.isCalled = true;
                        // On Call back with Auth code this method will be called.
                        this.handleOauthToken(message);
                    };
                    // Wait till we get auth_code from calling site through redirect url, we will wait for 3 mins
                    await this.waitForAuthentication(this.oauthConf.authTimeout);

                    if (!this.isCalled && this.childWin.closed) {
                        // Add error message if the user has close the authentication window without taking any action
                        this.setErrorMsg(ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN);
                        this.props.handleFormSubmit(
                            /* isSubmitting */ false,
                            /* closeEntity */ false
                        );
                        return false;
                    }

                    if (!this.isCalled) {
                        // Add timeout error message
                        this.setErrorMsg(ERROR_REQUEST_TIMEOUT_TRY_AGAIN);
                        this.props.handleFormSubmit(
                            /* isSubmitting */ false,
                            /* closeEntity */ false
                        );
                        return false;
                    }

                    // Reset called flag as we have to wait till we get the access_token, refresh_token and instance_url
                    // Wait till we get the response, here we have added wait for 30 secs
                    await this.waitForBackendResponse(30);

                    if (!this.isResponse && !this.isError) {
                        // Set error message to prevent saving.
                        this.isError = true;

                        // Add timeout error message
                        this.setErrorMsg(ERROR_REQUEST_TIMEOUT_ACCESS_TOKEN_TRY_AGAIN);
                        this.props.handleFormSubmit(
                            /* isSubmitting */ false,
                            /* closeEntity */ false
                        );
                        return false;
                    }
                    return true;
                })().then(() => {
                    if (!this.isError) {
                        this.saveData();
                    } else {
                        this.props.handleFormSubmit(
                            /* isSubmitting */ false,
                            /* closeEntity */ false
                        );
                    }
                });
            } else {
                this.saveData();
            }
        };
        if (
            this.hook &&
            typeof this.hook.onSave === 'function' &&
            typeof this.onSavePromise !== 'undefined'
        ) {
            this.onSavePromise.then(() => {
                executeValidationSubmit();
            });
        } else {
            executeValidationSubmit();
        }
    };

    saveData = () => {
        const body = new URLSearchParams();
        Object.keys(this.datadict).forEach((key) => {
            if (this.datadict[key] != null) {
                // Custom logic for only sending file content in payload, not file name and file size.
                if (
                    typeof this.datadict[key] === 'object' &&
                    this.entities.find((x) => x.field === key).type === 'file'
                ) {
                    body.append(key, this.datadict[key].fileContent);
                } else {
                    body.append(key, this.datadict[key]);
                }
            }
        });

        // clear out fields of other authentication methods when using one
        if (this.isAuthVal) {
            Object.keys(this.authMap).forEach((type) => {
                if (this.datadict.auth_type !== type) {
                    this.authMap[type].forEach((e) => {
                        body.set(e, '');
                    });
                }
            });
        }

        if (this.isOAuth) {
            // Prevent passing redirect_url field used in OAuth to backend conf file
            body.delete('redirect_url');
        }
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
            .then((response) => {
                const val = response?.data?.entry[0];
                if (this.props.mode !== MODE_CONFIG) {
                    const tmpObj = {};

                    tmpObj[val.name] = {
                        // ADDON-38581: `datadict` provides fallback values if rh skips
                        ...this.datadict,
                        ...val.content,
                        id: val.id,
                        name: val.name,
                        serviceName: this.props.serviceName,
                    };

                    this.context.setRowData(
                        update(this.context?.rowData, {
                            [this.props.serviceName]: { $merge: tmpObj },
                        })
                    );
                }
                if (this.hook && typeof this.hook.onSaveSuccess === 'function') {
                    this.hook.onSaveSuccess();
                }
                if (this.props.mode === MODE_EDIT) {
                    generateToast(`Updated "${val.name}"`, 'success');
                } else if (this.props.mode === MODE_CONFIG) {
                    generateToast(
                        `Updated "${this.mode_config_title ? this.mode_config_title : val.name}"`,
                        'success'
                    );
                } else {
                    generateToast(`Created "${val.name}"`, 'success');
                }
                this.props.handleFormSubmit(/* isSubmitting */ false, /* closeEntity */ true);
            })
            .catch((err) => {
                const errorSubmitMsg = parseErrorMsg(err);
                this.setState({ errorMsg: errorSubmitMsg });
                if (this.hook && typeof this.hook.onSaveFail === 'function') {
                    this.hook.onSaveFail();
                }
                this.props.handleFormSubmit(/* isSubmitting */ false, /* closeEntity */ false);
            });
    };

    handleChange = (field, targetValue) => {
        this.setState((prevState) => {
            const changes = {};
            if (field === 'auth_type') {
                Object.keys(this.authMap).forEach((type) => {
                    if (type === targetValue) {
                        this.authMap[type].forEach((e) => {
                            changes[e] = { display: { $set: true } };
                        });
                    } else {
                        this.authMap[type].forEach((e) => {
                            changes[e] = { display: { $set: false } };
                        });
                    }
                });
            }

            if (this.dependencyMap.has(field)) {
                const value = this.dependencyMap.get(field);
                Object.keys(value).forEach((loadField) => {
                    const data = {};
                    let load = true;

                    value[loadField].forEach((dependency) => {
                        const required = !!this.entities.find((e) => e.field === dependency)
                            .required;

                        const currentValue =
                            dependency === field ? targetValue : prevState.data[dependency].value;
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

            const newFields = update(prevState, { data: changes });
            const tempState = this.clearAllErrorMsg(newFields);

            if (this.hookDeferred) {
                this.hookDeferred.then(() => {
                    if (typeof this.hook.onChange === 'function') {
                        this.hook.onChange(field, targetValue, tempState);
                    }
                });
            }

            return tempState;
        });
    };

    addCustomValidator = (field, validatorFunc) => {
        const index = this.entities.findIndex((x) => x.field === field);
        const validator = [{ type: 'custom', validatorFunc }];
        this.entities[index].validators = validator;
    };

    // Set error message to display and set error in perticular field
    setErrorFieldMsg = (field, msg) => {
        this.setState((previousState) => {
            const newFields = update(previousState, {
                data: { [field]: { error: { $set: true } } },
            });
            newFields.errorMsg = msg;
            return newFields;
        });
    };

    // Set error in perticular field
    // eslint-disable-next-line react/no-unused-class-component-methods
    setErrorField = (field) => {
        this.setState((previousState) =>
            update(previousState, { data: { [field]: { error: { $set: true } } } })
        );
    };

    // Clear error message
    clearErrorMsg = () => {
        if (this.state.errorMsg) {
            this.setState((previousState) => ({ ...previousState, errorMsg: '' }));
        }
    };

    // Set error message
    setErrorMsg = (msg) => {
        this.setState((previousState) => ({ ...previousState, errorMsg: msg }));
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
    loadHook = (module, type, globalConfig) => {
        const myPromise = new Promise((resolve) => {
            if (type === 'external') {
                import(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${module}.js`).then(
                    (external) => {
                        const Hook = external.default;
                        this.hook = new Hook(
                            globalConfig,
                            this.props.serviceName,
                            this.state,
                            this.props.mode,
                            this.util,
                            this.props.groupName
                        );
                        resolve(Hook);
                    }
                );
            } else {
                __non_webpack_require__(
                    [`app/${this.appName}/js/build/custom/${module}`],
                    (Hook) => {
                        this.hook = new Hook(
                            globalConfig,
                            this.props.serviceName,
                            this.state,
                            this.props.mode,
                            this.util
                        );
                        resolve(Hook);
                    }
                );
            }
        });
        return myPromise;
    };

    /*
     * Function to get access token, refresh token and instance url
     * using rest call once oauth code received from child window
     */
    // eslint-disable-next-line consistent-return
    handleOauthToken = (message) => {
        // Check message for error. If error show error message.
        if (!message || (message && message.error) || message.code === undefined) {
            this.setErrorMsg(ERROR_OCCURRED_TRY_AGAIN);
            this.isError = true;
            this.isResponse = true;
            return false;
        }
        const stateResponse = message.state;

        if (this.state_enabled === true && this.oauth_state !== stateResponse) {
            this.setErrorMsg(ERROR_STATE_MISSING_TRY_AGAIN);
            this.isError = true;
            this.isResponse = true;
            return false;
        }

        const code = decodeURIComponent(message.code);
        const data = {
            method: 'POST',
            url: `https://${this.datadict.endpoint}${this.oauthConf.accessTokenEndpoint}`,
            grant_type: 'authorization_code',
            client_id: this.datadict.client_id,
            client_secret: this.datadict.client_secret,
            code,
            redirect_uri: this.datadict.redirect_url,
        };

        if (this.datadict.scope) {
            data.scope = this.datadict.scope;
        }

        const body = new URLSearchParams();
        Object.keys(data).forEach((key) => {
            body.append(key, data[key]);
        });

        const OAuthEndpoint = `${this.appName}_oauth/oauth`;
        // Internal handler call to get the access token and other values
        axiosCallWrapper({
            endpointUrl: OAuthEndpoint,
            body,
            customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'post',
            handleError: false,
        })
            .then((response) => {
                if (response.data.entry[0].content.error === undefined) {
                    const accessToken = response.data.entry[0].content.access_token;
                    const instanceUrl = response.data.entry[0].content.instance_url;
                    const refreshToken = response.data.entry[0].content.refresh_token;

                    this.datadict.instance_url = instanceUrl;
                    this.datadict.refresh_token = refreshToken;
                    this.datadict.access_token = accessToken;
                    this.isResponse = true;
                    return true;
                }
                this.setErrorMsg(response.data.entry[0].content.error);
                this.isError = true;
                this.isResponse = true;
                return false;
            })
            .catch(() => {
                this.setErrorMsg(ERROR_OCCURRED_TRY_AGAIN);
                this.isError = true;
                this.isResponse = true;
                return false;
            });
    };

    // Function to wait for authentication call back in child window.
    // eslint-disable-next-line consistent-return
    waitForAuthentication = async (count) => {
        // eslint-disable-next-line no-param-reassign
        count -= 1;
        // Check if callback function called if called then exit from wait
        if (this.isCalled === true) {
            return true;
        }
        // If callback function is not called and count is not reached to 180 then return error for timeout
        if (count === 0 || this.childWin.closed) {
            this.isError = true;
            return false;
        }
        // else call sleep and recall the same function
        await this.sleep(this.waitForAuthentication, count);
    };

    // Function to wait for backend call get response from backend

    // eslint-disable-next-line consistent-return
    waitForBackendResponse = async (count) => {
        // eslint-disable-next-line no-param-reassign
        count += 1;
        // Check if callback function called if called then exit from wait
        if (this.isResponse === true) {
            return true;
        }
        // If callback function is not called and count is not reached to 60 then return error for timeout
        if (count === 60) {
            return false;
        }
        // else call sleep and recall the same function
        await this.sleep(this.waitForBackendResponse, count);
    };

    /*
     * This function first add sleep for 1 secs and the call the function passed in argument
     */
    sleep = async (fn, ...args) => {
        await this.timeout(1000);
        return fn(...args);
    };

    /*
     * This function will resolve the promise once the provided timeout occurs
     */
    // eslint-disable-next-line class-methods-use-this
    timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // eslint-disable-line no-promise-executor-return

    renderGroupElements = () => {
        let el = null;
        if (this.groups && this.groups.length) {
            el = this.groups.map((group) => {
                const collapsibleElement =
                    group.fields?.length &&
                    group.fields.map((fieldName) =>
                        this.entities.map((e) => {
                            if (e.field === fieldName) {
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
                                        markdownMessage={temState.markdownMessage}
                                        dependencyValues={temState.dependencyValues || null}
                                    />
                                );
                            }
                            return null;
                        })
                    );

                return (
                    <Group
                        key={group.label}
                        isExpandable={group.options?.isExpandable}
                        defaultOpen={group.options?.expand}
                        title={group.label}
                    >
                        {collapsibleElement}
                    </Group>
                );
            });
        }
        return el;
    };

    render() {
        // onRender method of Hook
        if (this.flag) {
            if (this.hookDeferred) {
                this.hookDeferred.then(() => {
                    if (typeof this.hook.onRender === 'function') {
                        try {
                            this.hook.onRender();
                        } catch (error) {
                            onCustomHookError({ methodName: 'onRender', error });
                        }
                    }
                });
            }

            if (this.props.mode === MODE_EDIT) {
                if (this.hookDeferred) {
                    this.hookDeferred.then(() => {
                        if (typeof this.hook.onEditLoad === 'function') {
                            try {
                                this.hook.onEditLoad();
                            } catch (error) {
                                onCustomHookError({ methodName: 'onEditLoad', error });
                            }
                        }
                    });
                }
            }
            this.flag = false;
        }
        return (
            <div>
                <form style={this.props.mode === MODE_CONFIG ? { marginTop: '25px' } : {}}>
                    {this.generateWarningMessage()}
                    {this.generateErrorMessage()}
                    {this.entities.map((e) => {
                        // Return null if we need to show element in a group
                        if (this.groupEntities.includes(e.field)) {
                            return null;
                        }

                        const temState = this.state.data[e.field];

                        if (!temState) {
                            return null;
                        }

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
                                markdownMessage={temState.markdownMessage}
                                dependencyValues={temState.dependencyValues || null}
                                fileNameToDisplay={temState.fileNameToDisplay || null}
                            />
                        );
                    })}
                    {this.renderGroupElements()}
                </form>
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
    groupName: PropTypes.string,
};

export default BaseFormView;
