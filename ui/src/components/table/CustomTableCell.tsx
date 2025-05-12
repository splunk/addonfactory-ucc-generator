import React, { Component } from 'react';
import { _ } from '@splunk/ui-utils/i18n';

import ExclamationTriangle from '@splunk/react-icons/ExclamationTriangle';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { RowDataFields } from '../../context/TableContext';
import { CustomCellBase, CustomCellConstructor } from './CustomTableCellBase';
import { invariant } from '../../util/invariant';

type CustomCellError = {
    methodName: string;
    error: Error | null;
};

function onCustomCellError(params: { methodName: string; error: Error | null }) {
    // eslint-disable-next-line no-console
    console.error(
        `[Custom Cell] Something went wrong while calling ${params.methodName}. Error: ${params.error?.name} ${params.error?.message}`
    );
}

type CustomTableCellProps = {
    serviceName: string;
    row: RowDataFields;
    field: string;
    fileName: string;
    type: string;
};

type CustomTableCellState = {
    loading: boolean;
    row: RowDataFields;
    methodNotPresentError: string;
    rowUpdatedByControl: boolean;
};

class CustomTableCell extends Component<CustomTableCellProps, CustomTableCellState> {
    customCell?: CustomCellBase;

    el: HTMLSpanElement | null = null;

    constructor(props: CustomTableCellProps) {
        super(props);
        this.state = {
            loading: true,
            row: { ...props.row },
            methodNotPresentError: '', // Stores error message if a method is missing
            rowUpdatedByControl: false, // Flag to track if the row was updated by custom control
        };
    }

    // Lifecycle method that updates the component's state when props change
    static getDerivedStateFromProps(
        nextProps: CustomTableCellProps,
        prevState: CustomTableCellState
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
        this.initializeCustomCell();
    }

    componentDidUpdate(prevProps: CustomTableCellProps) {
        // If the row prop has changed, re-initialize the custom cell
        // is that one needed, to be checked
        if (prevProps.row !== this.props.row) {
            this.initializeCustomCell();
            this.setState({ rowUpdatedByControl: false });
        }
    }

    loadCustomCell = (): Promise<CustomCellConstructor> =>
        new Promise((resolve, reject) => {
            const { type, fileName } = this.props;
            const globalConfig = getUnifiedConfigs();

            if (type === 'external') {
                import(/* @vite-ignore: true */ `${getBuildDirPath()}/custom/${fileName}.js`)
                    .then((external) => resolve(external.default))
                    .catch((error) => reject(error));
            } else {
                const appName = globalConfig.meta.name;

                // @ts-expect-error should be exported to other js module and imported here
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${fileName}`],
                    (Cell: CustomCellConstructor) => resolve(Cell),
                    (error: Error) => reject(error)
                );
            }
        });

    handleNoRender = () => {
        if (!this.customCell || typeof this.customCell.render !== 'function') {
            this.setState((prevState) => ({
                ...prevState,
                methodNotPresentError: '"Render" method should be present.',
            }));
        }
        this.setState((prevState) => ({
            ...prevState,
            loading: false,
        }));
    };

    // Function to initialize the custom cell, loading the module and calling methods on it
    async initializeCustomCell() {
        const globalConfig = getUnifiedConfigs();
        this.loadCustomCell()
            .then(async (Cell: CustomCellConstructor) => {
                if (typeof Cell !== 'function') {
                    this.setState({
                        loading: false,
                        methodNotPresentError: 'Loaded module is not a constructor function',
                    });
                    return;
                }

                invariant(this.el, 'Element reference is not set');
                this.customCell = new Cell(
                    globalConfig,
                    this.props.serviceName,
                    this.el,
                    this.state.row,
                    this.props.field
                );

                this.handleNoRender();
            })
            .catch(() =>
                this.setState({
                    loading: false,
                    methodNotPresentError: 'Error loading custom Cell module',
                })
            );
    }

    render() {
        const { loading, methodNotPresentError } = this.state;

        if (!loading && this.customCell && typeof this.customCell.render === 'function') {
            try {
                this.customCell.render();
            } catch (error) {
                onCustomCellError({ methodName: 'render', error } as CustomCellError);
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

export default CustomTableCell;
