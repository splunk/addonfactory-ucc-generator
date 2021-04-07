import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../util/util';

class CustomControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
        this.shouldRender = true;
    }

    componentDidMount() {
        const globalConfig = getUnifiedConfigs();
        const appName = globalConfig.meta.name;

        this.loadCustomControl(this.props.controlOptions.src, appName).then((Control) => {
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
            this.setState({loading: false});
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    loadCustomControl = (module, appName) => {
        const myPromise = new Promise((myResolve) => {
            __non_webpack_require__([`app/${appName}/js/build/custom/${module}`], (Control) => {
                myResolve(Control);
            });
        });
        return myPromise;
    };

    setValue = (newValue) => {
        this.props.handleChange(this.props.field, newValue);
    };

    render() {
        return (
            <>
                {this.state.loading && _("Loading...")}
                {<span ref={(el) => { this.el = el; }} style={{visibility: this.state.loading ? 'hidden': 'visible'}} />}
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
