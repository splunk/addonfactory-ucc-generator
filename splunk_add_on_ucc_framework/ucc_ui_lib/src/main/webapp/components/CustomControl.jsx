import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getUnifiedConfigs } from '../util/util';

class CustomControl extends Component {
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
        });
    }

    shouldComponentUpdate() {
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
            <div
                ref={(el) => {
                    this.el = el;
                }}
            />
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
