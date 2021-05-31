import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';

import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';

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

const CollapsiblePanelWrapper = styled(CollapsiblePanel)`
    span {
        button {
            background-color: transparent;
            font-size: 16px;
            margin: 10px 0;

            &:hover:not([disabled]),
            &:focus:not([disabled]),
            &:active:not([disabled]) {
                background-color: transparent;
                box-shadow: none;
            }
        }
    }

    .collapsible-element {
        padding-top: 15px;
    }
`;

const CustomGroupLabel = styled.div`
    padding: 6px 10px;
    background-color: #f2f4f5;
`;

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
                ? `${this.props.serviceName}/${encodeURIComponent(this.props.stanzaName)}`
                : `${this.props.serviceName}`;

        this.util = {
            setState: (callback) => {
                this.onSavePromise = new Promise((resolve) => {
                    this.setState((previousState) => {
                        return callback(previousState);
                    }, resolve);
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
                    this.updateEntitiesForGroup(service);
                    this.options = service.options;
                    if (service.hook) {
                        this.hookDeferred = this.loadHook(
                            service.hook.src,
                            service.hook.type,
                            globalConfig
                        );
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
                        this.hookDeferred = this.loadHook(
                            tab.hook.src,
                            tab.hook.type,
                            globalConfig
                        );
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
        this.dependencyMap = new Map();
        this.isOAuth = false;
        this.isAuthVal = false;
        this.authMap = {};
        const temState = {};
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
                            props.mode === MODE_CREATE ? authType[0] : this.currentInput.auth_type;
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
                        entity.options.isClearable = true;
                        entity.options.autoCompleteFields = authType.map((type) => {
                            return { label: content[type], value: type };
                        });
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
                                        : this.currentInput[field.field];
                                }
                                tempEntity.display =
                                    typeof temState.auth_type !== 'undefined'
                                        ? type === temState.auth_type.value
                                        : true;
                                tempEntity.error = false;
                                tempEntity.disabled = false;
                                temState[field.field] = tempEntity;
                                // eslint-disable-next-line no-param-reassign
                                field.required = !this.isAuthVal;
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

                        this.oauthConf = oauthConfData;
                    }
                }
            } else {
                const tempEntity = {};
                e.encrypted = typeof e.encrypted !== 'undefined' ? e.encrypted : false;

                if (props.mode === MODE_CREATE) {
                    tempEntity.value =
                        typeof e.defaultValue !== 'undefined' ? e.defaultValue : null;
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
                    tempEntity.value = e.encrypted ? '' : tempEntity.value;

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
                    tempEntity.value =
                        e.field === 'name' || e.encrypted ? '' : this.currentInput[e.field];
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
                    tempEntity.value = e.encrypted ? '' : tempEntity.value;
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
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    }
                }
            });
        }
    }

    updateEntitiesForGroup = (service) => {
        if (this.groups && this.groups.length) {
            this.groups.forEach((group) => {
                if (group && group.fields?.length) {
                    group.fields.forEach((fieldName) => {
                        const index = service.entity.findIndex((e) => e.field === fieldName);

                        if (index !== -1) {
                            const updatedObj = JSON.parse(JSON.stringify(service.entity[index]));
                            updatedObj.isGrouping = true;
                            this.entities.splice(index, 1, updatedObj);
                        }
                    });
                }
            });
        }
    };

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
                    Object.values(this.context.rowData).find((val) =>
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
            if (this.isAuthVal) {
                let reqFields = [];
                Object.keys(this.authMap).forEach((type) => {
                    if (type === this.datadict.auth_type) {
                        reqFields = [...reqFields, ...this.authMap[type]];
                    }
                });
                temEntities = this.entities.map((e) => {
                    if (reqFields.includes(e.field)) {
                        return { ...e, required: true };
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

                const host = `https://${this.datadict.endpoint}${this.oauthConf.authCodeEndpoint}${parameters}`;
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
                body.append(key, this.datadict[key]);
            }
        });

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
                if (this.props.mode === MODE_EDIT || this.props.mode === MODE_CONFIG) {
                    generateToast(`Updated ${val.name}`, 'success');
                } else {
                    generateToast(`Created ${val.name}`, 'success');
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
                    this.hook.onChange(field, targetValue, tempState);
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
        this.setState((previousState) => {
            const newFields = update(previousState, {
                data: { [field]: { error: { $set: true } } },
            });
            newFields.errorMsg = msg;
            return newFields;
        });
    };

    // Set error in perticular field
    setErrorField = (field) => {
        this.setState((previousState) => {
            return update(previousState, { data: { [field]: { error: { $set: true } } } });
        });
    };

    // Clear error message
    clearErrorMsg = () => {
        if (this.state.errorMsg) {
            this.setState((previousState) => {
                return { ...previousState, errorMsg: '' };
            });
        }
    };

    // Set error message
    setErrorMsg = (msg) => {
        this.setState((previousState) => {
            return { ...previousState, errorMsg: msg };
        });
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
                            this.util
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
    timeout = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    renderGroupElements = () => {
        let el = null;
        if (this.groups && this.groups.length) {
            el = this.groups.map((group) => {
                const collpsibleElement =
                    group.fields?.length &&
                    group.fields.map((fieldName) => {
                        return this.entities.map((e) => {
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
                        });
                    });

                return group.options.isExpandable ? (
                    <CollapsiblePanelWrapper title={group.label}>
                        <div className="collapsible-element">{collpsibleElement}</div>
                    </CollapsiblePanelWrapper>
                ) : (
                    <>
                        <CustomGroupLabel>{group.label}</CustomGroupLabel>
                        <div>{collpsibleElement}</div>
                    </>
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
                        } catch (err) {
                            // eslint-disable-next-line no-console
                            console.error(err);
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
                            } catch (err) {
                                // eslint-disable-next-line no-console
                                console.error(err);
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
                    {this.renderGroupElements()}
                    {this.entities.map((e) => {
                        // Return null if we need to show element in a group
                        if (e.isGrouping) {
                            return null;
                        }
                        const temState = this.state.data[e.field];

                        if (temState.placeholder) {
                            // eslint-disable-next-line no-param-reassign
                            e = {
                                ...e,
                                options: { ...e.options, placeholder: temState.placeholder },
                            };
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
                            />
                        );
                    })}
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
};

export default BaseFormView;
