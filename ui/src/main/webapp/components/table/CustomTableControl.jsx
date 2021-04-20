import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';

class CustomTableControl extends Component {
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
            const customControl = new Control(
                globalConfig,
                this.props.serviceName,
                this.el,
                this.props.row,
                this.props.field
            );
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

CustomTableControl.propTypes = {
    serviceName: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired,
    field: PropTypes.string,
    fileName: PropTypes.string.isRequired,
};

export default CustomTableControl;
