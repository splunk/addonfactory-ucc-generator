import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../util/util';

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
        this.loadCustomControl().then((Control) => {
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

    loadCustomControl = () => {
        const globalConfig = getUnifiedConfigs();
        const appName = globalConfig.meta.name;
        return new Promise((resolve) => {
            __non_webpack_require__(
                [`app/${appName}/js/build/custom/${this.props.fileName}`],
                (Control) => resolve(Control)
            );
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
