import React, { Component } from 'react';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../util/util';
import { getBuildDirPath } from '../util/script';
import { AcceptableFormValueOrNullish } from '../types/components/shareableTypes';
import { UtilBaseForm } from './BaseFormView/BaseFormTypes';
import { GlobalConfig } from '../types/globalConfig/globalConfig';
import { Mode } from '../constants/modes';

interface IData {
    value: AcceptableFormValueOrNullish;
    mode: Mode;
    serviceName: string;
}

interface ICustomCompClass {
    new (
        config: GlobalConfig,
        data: IData,
        setValue: (field: string, newValue: AcceptableFormValueOrNullish) => void,
        util: UtilBaseForm,
        el?: HTMLElement | undefined
    ): {
        render: () => void;
        validation?: (submittedField: string, submittedValue: string) => void;
    };
}

interface ICustomCompProps {
    data: IData;
    field: string;
    handleChange: (field: string, newValue: AcceptableFormValueOrNullish) => void;
    controlOptions: { src: string; type: string };
    addCustomValidator: (
        field: string,
        validatorFunc: (submittedField: string, submittedValue: string) => void
    ) => void;
    utilCustomFunctions: UtilBaseForm;
}

interface State {
    loading: boolean;
}

class CustomControl extends Component<ICustomCompProps, State> {
    static loadCustomControl = (
        module: string,
        type: string,
        appName: string
    ): Promise<ICustomCompClass> =>
        new Promise((resolve) => {
            if (type === 'external') {
                import(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${module}.js`).then(
                    (external) => {
                        const Control = external.default;
                        resolve(Control);
                    }
                );
            } else {
                // @ts-expect-error typeof __non_webpack_require__ is not known during bundle
                __non_webpack_require__([`app/${appName}/js/build/custom/${module}`], (Control) => {
                    resolve(Control);
                });
            }
        });

    shouldRender: boolean;

    el?: HTMLElement;

    constructor(props: ICustomCompProps) {
        super(props);
        this.state = {
            loading: true,
        };
        this.shouldRender = true;
    }

    componentDidMount() {
        const globalConfig = getUnifiedConfigs();
        const appName = globalConfig.meta.name;

        CustomControl.loadCustomControl(
            this.props.controlOptions.src,
            this.props.controlOptions.type,
            appName
        ).then((Control) => {
            const customControl = new Control(
                globalConfig,
                this.props.data,
                this.setValue,
                this.props.utilCustomFunctions,
                this.el
            );
            customControl.render();

            if (typeof customControl.validation === 'function') {
                this.props.addCustomValidator(this.props.field, customControl.validation);
            }
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(nextProps: ICustomCompProps, nextState: State) {
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    setValue = (newValue: AcceptableFormValueOrNullish) => {
        this.props.handleChange(this.props.field, newValue);
    };

    render() {
        return (
            <>
                {this.state.loading && _('Loading...')}
                {
                    <span // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                        ref={(el) => {
                            if (el) {
                                this.el = el;
                            }
                        }}
                        style={{ visibility: this.state.loading ? 'hidden' : 'visible' }}
                    />
                }
            </>
        );
    }
}

export default CustomControl;
