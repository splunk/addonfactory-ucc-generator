import React, { Component } from 'react';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';
import { CustomMenuConstructor } from './CustomMenuBase';
import { invariant } from '../../util/invariant';
import { CustomComponentContextType } from '../../context/CustomComponentContext';

type CustomMenuProps = {
    fileName: string;
    type: string;
    handleChange: (val: { service: string; input?: string }) => void;
    customComponentContext?: CustomComponentContextType;
};

type CustomMenuState = {
    loading: boolean;
};

class CustomMenu extends Component<CustomMenuProps, CustomMenuState> {
    customComponentContext?: CustomComponentContextType;

    shouldRender: boolean;

    el?: HTMLElement;

    constructor(props: CustomMenuProps) {
        super(props);
        this.state = {
            loading: true,
        };
        this.shouldRender = true;
        this.customComponentContext = props.customComponentContext;
    }

    componentDidMount() {
        const unifiedConfigs = getUnifiedConfigs();
        if (unifiedConfigs.pages.inputs === undefined) {
            return;
        }

        const groupsMenu =
            'groupsMenu' in unifiedConfigs.pages.inputs
                ? unifiedConfigs.pages.inputs.groupsMenu
                : undefined;
        const customMenuField =
            'menu' in unifiedConfigs.pages.inputs ? unifiedConfigs.pages.inputs.menu : undefined;
        const { services } = unifiedConfigs.pages.inputs;

        this.setState({ loading: true });
        this.loadCustomMenu().then((Control: CustomMenuConstructor) => {
            invariant(this.el !== undefined, 'Element should be defined');
            const customControl = new Control(unifiedConfigs, this.el, this.setValue);
            if (services && customMenuField && !groupsMenu) {
                customControl.render();
            }
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(_nextProps: CustomMenuProps, nextState: CustomMenuState) {
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    setValue = (newValue: { service: string; input?: string }) => {
        this.props.handleChange(newValue);
    };

    loadCustomMenu = (): Promise<CustomMenuConstructor> =>
        new Promise((resolve) => {
            const customComp = this.customComponentContext?.[this.props.fileName];
            if (customComp?.type === 'menu') {
                const Control = customComp.component;
                resolve(Control);
            } else if (this.props.type === 'external') {
                import(/* @vite-ignore */ `${getBuildDirPath()}/custom/${this.props.fileName}.js`)
                    .then((external) => {
                        const Control = external.default;
                        resolve(Control as CustomMenuConstructor);
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(`[Custom Menu] Error loading custom menu ${error.message}`);
                    });
            } else {
                const globalConfig = getUnifiedConfigs();
                const appName = globalConfig.meta.name;
                require([`app/${appName}/js/build/custom/${this.props.fileName}`], (
                    Control: CustomMenuConstructor
                ) => {
                    resolve(Control);
                });
            }
        });

    render() {
        return (
            <>
                {this.state.loading && _('Loading...')}
                <span
                    ref={(el) => {
                        if (el) {
                            this.el = el;
                        }
                    }}
                    style={{ visibility: this.state.loading ? 'hidden' : 'visible' }}
                />
            </>
        );
    }
}

export default CustomMenu;
