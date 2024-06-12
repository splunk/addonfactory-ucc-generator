import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DL from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
// eslint-disable-next-line import/no-cycle
import { getExpansionRowData } from './TableExpansionRow';

function onCustomControlError(params) {
    // eslint-disable-next-line no-console
    console.error(
        `[Custom Control] Something went wrong while calling ${params.methodName}. Error: ${params.error?.name} ${params.error?.message}`
    );
}

class CustomTableControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            row: { ...props.row },
            checkMethodIsPresent: false,
            methodNotPresentError: '',
        };
        this.shouldRender = true;
    }

    componentDidMount() {
        const globalConfig = getUnifiedConfigs();
        this.loadCustomControl()
            .then((Control) => {
                if (typeof Control === 'function') {
                    this.customControl = new Control(
                        globalConfig,
                        this.props.serviceName,
                        this.el,
                        this.state.row,
                        this.props.field
                    );

                    this.callCustomMethod('getDLRows')
                        .then((result) => {
                            // check if getDLRow is exist in the custom input row file
                            if (result && typeof result === 'object' && !Array.isArray(result)) {
                                this.setState({
                                    row: { ...result },
                                    checkMethodIsPresent: true,
                                    loading: false,
                                });
                            } else if (result !== null) {
                                // check if getDLRow return invalid object
                                this.setState({
                                    loading: false,
                                    checkMethodIsPresent: true,
                                    methodNotPresentError:
                                        'getDLRows method did not return a valid object',
                                });
                            } else {
                                // if getDLRow is not present then check render method is present or not
                                this.handleNoGetDLRows();
                            }
                        })
                        .catch((error) => {
                            onCustomControlError({ methodName: 'getDLRows', error });
                            this.handleNoGetDLRows();
                        });
                } else {
                    this.setState({
                        loading: false,
                        methodNotPresentError: 'Loaded module is not a constructor function',
                    });
                }
            })
            .catch(() =>
                this.setState({
                    loading: false,
                    methodNotPresentError: 'Error loading custom control',
                })
            );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.row !== nextProps.row) {
            return true;
        }
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    loadCustomControl = () =>
        new Promise((resolve, reject) => {
            const { type, fileName } = this.props;
            const globalConfig = getUnifiedConfigs();

            if (type === 'external') {
                import(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${fileName}.js`)
                    .then((external) => resolve(external.default))
                    .catch((error) => reject(error));
            } else {
                const appName = globalConfig.meta.name;
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${fileName}`],
                    (Control) => resolve(Control),
                    (error) => reject(error)
                );
            }
        });

    callCustomMethod = async (methodName, ...args) => {
        try {
            if (typeof this.customControl[methodName] === 'function') {
                return this.customControl[methodName](...args);
            }
            return null;
        } catch (error) {
            onCustomControlError({ methodName, error });
            return null;
        }
    };

    handleNoGetDLRows = () => {
        if (!this.customControl || typeof this.customControl.render !== 'function') {
            this.setState((prevState) => ({
                ...prevState,
                methodNotPresentError:
                    'At least "render" either "getDLRows" method should be present.',
            }));
        }
        this.setState((prevState) => ({
            ...prevState,
            loading: false,
        }));
    };

    render() {
        const { row, loading, checkMethodIsPresent, methodNotPresentError } = this.state;
        const { moreInfo } = this.props;

        if (
            !loading &&
            !checkMethodIsPresent &&
            this.customControl &&
            typeof this.customControl.render === 'function'
        ) {
            try {
                this.customControl.render(row, moreInfo);
            } catch (error) {
                onCustomControlError({ methodName: 'render', error });
            }
        }

        let content;

        if (methodNotPresentError) {
            content = (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    <ExclamationTriangle style={{ color: 'red', marginRight: '4px' }} />
                    {methodNotPresentError}
                </span>
            );
        } else if (checkMethodIsPresent) {
            content = <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>;
        } else {
            content = (
                <span
                    ref={(el) => {
                        this.el = el;
                    }}
                    style={{ visibility: loading ? 'hidden' : 'visible' }}
                />
            );
        }

        return (
            <>
                {loading && _('Loading...')}
                {content}
            </>
        );
    }
}

CustomTableControl.propTypes = {
    serviceName: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired,
    field: PropTypes.string,
    fileName: PropTypes.string.isRequired,
    type: PropTypes.string,
    moreInfo: PropTypes.array.isRequired,
};

export default CustomTableControl;
