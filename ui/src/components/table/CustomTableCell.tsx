import React, { Component } from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { getExpansionRowData } from './TableExpansionRowData';
import { RowDataFields } from '../../context/TableContext';
import { CustomCellBase, CustomCellConstructor } from './CustomTableCellBase';
import { invariant } from '../../util/invariant';

type CustomControlError = {
    methodName: string;
    error: Error | null;
};

function onCustomControlError(params: { methodName: string; error: Error | null }) {
    // eslint-disable-next-line no-console
    console.error(
        `[Custom Control] Something went wrong while calling ${params.methodName}. Error: ${params.error?.name} ${params.error?.message}`
    );
}

type CustomTableControlProps = {
    serviceName: string;
    row: RowDataFields;
    field: string;
    fileName: string;
    type: string;
    moreInfo: {
        label: string;
        field: string;
        mapping?: Record<string, string> | undefined;
    }[];
};

type CustomTableControlState = {
    loading: boolean;
    row: RowDataFields;
    checkMethodIsPresent: boolean;
    methodNotPresentError: string;
    rowUpdatedByControl: boolean;
};

class CustomTableCell extends Component<CustomTableControlProps, CustomTableControlState> {
    customControl?: CustomCellBase;

    el: HTMLSpanElement | null = null;

    shouldRender: boolean;

    constructor(props: CustomTableControlProps) {
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
    static getDerivedStateFromProps(
        nextProps: CustomTableControlProps,
        prevState: CustomTableControlState
    ) {
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

    shouldComponentUpdate(nextProps: CustomTableControlProps, nextState: CustomTableControlState) {
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

    componentDidUpdate(prevProps: CustomTableControlProps) {
        // If the row prop has changed, re-initialize the custom control
        if (prevProps.row !== this.props.row) {
            this.initializeCustomControl();
            this.setState({ rowUpdatedByControl: false });
        }
    }

    loadCustomControl = (): Promise<CustomCellConstructor> =>
        new Promise((resolve, reject) => {
            const { type, fileName } = this.props;
            const globalConfig = getUnifiedConfigs();

            if (type === 'external') {
                import(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${fileName}.js`)
                    .then((external) => resolve(external.default))
                    .catch((error) => reject(error));
            } else {
                const appName = globalConfig.meta.name;

                // @ts-expect-error should be exported to other js module and imported here
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${fileName}`],
                    (Control: CustomCellConstructor) => resolve(Control),
                    (error: Error) => reject(error)
                );
            }
        });

    // /**
    //  * Calls a method on the customControl instance, if it exists, with the provided arguments.
    //  *
    //  * @param {string} methodName - The name of the method to call on the customControl class instance.
    //  * @param  {...unknown} args - Any arguments that should be passed to the method.
    //  * @returns {*} - The response from the custom control method, or null if the method does not exist or an error occurs.
    //  */
    // callCustomMethod = async (methodName: string, ...args) => {
    //     try {
    //         if (typeof this?.customControl?.[methodName] === 'function') {
    //             return this.customControl[methodName](...args);
    //         }
    //         return null;
    //     } catch (error) {
    //         onCustomControlError({ methodName, error } as CustomControlError);
    //         return null;
    //     }
    // };

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
            .then(async (Control: CustomCellConstructor) => {
                if (typeof Control !== 'function') {
                    this.setState({
                        loading: false,
                        methodNotPresentError: 'Loaded module is not a constructor function',
                    });
                    return;
                }

                invariant(this.el, 'Element reference is not set');
                this.customControl = new Control(
                    globalConfig,
                    this.props.serviceName,
                    this.el,
                    this.state.row,
                    this.props.field
                );

                // Call the "getDLRows" method on the custom control instance
                try {
                    this.handleNoGetDLRows();
                } catch (error) {
                    onCustomControlError({ methodName: 'getDLRows', error } as CustomControlError);
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
                this.customControl.render();
            } catch (error) {
                onCustomControlError({ methodName: 'render', error } as CustomControlError);
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

// CustomTableControl.propTypes = {
//     serviceName: PropTypes.string.isRequired,
//     row: PropTypes.object.isRequired,
//     field: PropTypes.string,
//     fileName: PropTypes.string.isRequired,
//     type: PropTypes.string,
//     moreInfo: PropTypes.array.isRequired,
// };

// moreInfo: {
//     label: string;
//     field: string;
//     mapping?: Record<string, any> | undefined;
// }[]

export default CustomTableCell;
