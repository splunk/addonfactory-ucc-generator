import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../util/util';
import { getBuildDirPath } from '../util/script';

class CustomMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
        this.shouldRender = true;
    }

    componentDidMount() {
        const globalConfig = getUnifiedConfigs();
        this.setState({ loading: true });
        this.loadCustomMenu().then((Control) => {
            const customControl = new Control(globalConfig, this.el, this.setValue);
            customControl.render();
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    setValue = (newValue) => {
        this.props.handleChange(newValue);
    };

    loadCustomMenu = () => {
        const globalConfig = getUnifiedConfigs();
        const appName = globalConfig.meta.name;
        return new Promise((resolve) => {
            import(
                /* webpackIgnore: true */ `${getBuildDirPath()}/custom/${this.props.fileName}.js`
            ).then((external) => {
                const Control = external.default;
                resolve(Control);
            });
        });
    };

    render() {
        return (
            <>
                {this.state.loading && _('Loading...')}
                {
                    <span
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

CustomMenu.propTypes = {
    fileName: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
};

export default CustomMenu;
