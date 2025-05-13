import React from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { CustomValidatorFunc, UtilBaseForm } from '../../types/components/BaseFormTypes';
import { invariant } from '../../util/invariant';
import { CustomControlConstructor } from './CustomControlBase';
import { ControlData } from './CustomControl.types';
import CustomComponentContext from '../../context/CustomComponentContext';

interface Props {
    data: ControlData;
    field: string;
    handleChange: (field: string, newValue: AcceptableFormValueOrNullish) => void;
    controlOptions: { src: string; type: string };
    addCustomValidator: (field: string, validatorFunc: CustomValidatorFunc) => void;
    utilCustomFunctions: UtilBaseForm;
}

interface State {
    loading: boolean;
}

class CustomControl extends React.Component<Props, State> {
    static contextType = CustomComponentContext;

    static loadCustomControl = (
        module: string,
        type: string,
        appName: string,
        context?: React.ContextType<typeof CustomComponentContext>
    ): Promise<CustomControlConstructor> =>
        new Promise((resolve) => {
            const customComp = context?.[module]
            if (customComp?.type === 'control') {
                const Control = customComp.component;
                resolve(Control);
            } else if (type === 'external') {
                import(/* @vite-ignore */ `${getBuildDirPath()}/custom/${module}.js`).then(
                    async (external) => {
                        const Control = external.default as CustomControlConstructor;
                        resolve(Control);
                    }
                );
            } else {
                // @ts-expect-error typeof __non_webpack_require__ is not known during bundle
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${module}`],
                    (Control: CustomControlConstructor) => {
                        resolve(Control);
                    }
                );
            }
        });

    shouldRender: boolean;

    el?: HTMLElement;

    constructor(props: Props) {
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
            appName,
            this.context
        ).then((Control) => {
            invariant(this.el !== undefined, 'Element should be defined');
            const customControl = new Control(
                globalConfig,
                this.el,
                this.props.data,
                this.setValue,
                this.props.utilCustomFunctions
            );
            customControl?.render();

            if (typeof customControl.validation === 'function') {
                this.props.addCustomValidator(this.props.field, customControl.validation);
            }
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(_nextProps: Props, nextState: State) {
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
