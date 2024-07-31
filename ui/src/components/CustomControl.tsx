import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../util/util';
import { getBuildDirPath } from '../util/script';

interface ControlOptions {
    src: string;
    type: string;
}

interface propTypes {
    data: Record<string, any>;
    field: string;
    handleChange: (field: string, newValue: any) => void;
    controlOptions: ControlOptions;
    addCustomValidator: (field: string, validation: Function) => void;
    utilCustomFunctions: Record<string, any>;
}

interface State {
    loading: boolean;
}

class CustomControl extends Component<Props, State> {
    static loadCustomControl = (module: string, type: string, appName: string): Promise<any> =>
        new Promise((resolve) => {
            if (type === 'external') {
                import(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${module}.js`).then(
                    (external) => {
                        const Control = external.default;
                        resolve(Control);
                    }
                );
            } else {
                // @ts-expect-error
                __non_webpack_require__([`app/${appName}/js/build/custom/${module}`], (Control) => {
                    resolve(Control);
                });
            }
        });

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
            appName
        ).then((Control) => {
            const customControl = new Control(
                globalConfig,
                this.el,
                this.props.data,
                this.setValue,
                this.props.utilCustomFunctions
            );
            customControl.render();

            if (typeof customControl.validation === 'function') {
                this.props.addCustomValidator(this.props.field, customControl.validation);
            }
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    setValue = (newValue: any) => {
        this.props.handleChange(this.props.field, newValue);
    };

    el: HTMLElement | null = null;
    shouldRender: boolean = true;

    render() {
        return (
            <>
                {this.state.loading && _('Loading...')}
                {
                    <span // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                        ref={(el) => {
                            this.el = el;
                        }}
                        style={{ visibility: this.state.loading ? 'hidden' : 'visible' }}
                    />
                }
            </>
        );
    }
}

CustomControl.propTypes = {
    data: PropTypes.object,
    field: PropTypes.string,
    handleChange: PropTypes.func,
    controlOptions: PropTypes.object,
    addCustomValidator: PropTypes.func,
    utilCustomFunctions: PropTypes.object,
};

export default CustomControl;
