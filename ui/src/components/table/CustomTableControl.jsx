import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DL from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { getExpansionRowData } from './TableExpansionRowData';

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
            checkMethodIsPresent: false, // Flag to track if methods are available in custom control
            methodNotPresentError: '', // Stores error message if a method is missing
            rowUpdatedByControl: false, // Flag to track if the row was updated by custom control
        };
        this.shouldRender = true; // Flag to control rendering logic
    }

    // Lifecycle method that updates the component's state when props change
    static getDerivedStateFromProps(nextProps, prevState) {
        // Update row data only if the row prop has changed and it wasn't updated by control itself
        if (!prevState.rowUpdatedByControl && nextProps.row !== prevState.row) {
            return {
                row: { ...nextProps.row },
                loading: false, // Set loading to false when new row data is received
            };
        }
        return null;
    }

    // Lifecycle method called after the component has been mounted (first render)
    componentDidMount() {
        this.initializeCustomControl();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Trigger re-render if row prop or state has changed
        if (this.props.row !== nextProps.row || this.state.row !== nextState.row) {
            return true;
        }
        // Check if loading state is false and shouldRender flag is true to trigger re-render
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false; // Disable further re-renders
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps) {
        // If the row prop has changed, re-initialize the custom control
        if (prevProps.row !== this.props.row) {
            this.initializeCustomControl();
            this.setState({ rowUpdatedByControl: false });
        }
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

    /**
     * Calls a method on the customControl instance, if it exists, with the provided arguments.
     *
     * @param {string} methodName - The name of the method to call on the customControl class instance.
     * @param  {...unknown} args - Any arguments that should be passed to the method.
     * @returns {*} - The response from the custom control method, or null if the method does not exist or an error occurs.
     */
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

    // Function to initialize the custom control, loading the module and calling methods on it
    async initializeCustomControl() {
        const globalConfig = getUnifiedConfigs();
        this.loadCustomControl()
            .then(async (Control) => {
                if (typeof Control !== 'function') {
                    this.setState({
                        loading: false,
                        methodNotPresentError: 'Loaded module is not a constructor function',
                    });
                    return;
                }

                this.customControl = new Control(
                    globalConfig,
                    this.props.serviceName,
                    this.el,
                    this.state.row,
                    this.props.field
                );

                // Call the "getDLRows" method on the custom control instance
                const result = await this.callCustomMethod('getDLRows');
                try {
                    if (result && typeof result === 'object' && !Array.isArray(result)) {
                        // If getDLRows returns a valid object, update state with new row data
                        this.setState({
                            row: { ...result },
                            checkMethodIsPresent: true,
                            loading: false,
                            rowUpdatedByControl: true,
                        });
                    } else if (result !== null) {
                        // If result is not valid, show an error
                        this.setState({
                            loading: false,
                            checkMethodIsPresent: true,
                            methodNotPresentError: 'getDLRows method did not return a valid object',
                        });
                    } else {
                        this.handleNoGetDLRows();
                    }
                } catch (error) {
                    onCustomControlError({ methodName: 'getDLRows', error });
                    this.handleNoGetDLRows();
                }
            })
            .catch(() =>
                this.setState({
                    loading: false,
                    methodNotPresentError: 'Error loading custom control',
                })
            );
    }

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
    moreInfo: PropTypes.array, // more info not required when using for custom cell
};

export default CustomTableControl;
