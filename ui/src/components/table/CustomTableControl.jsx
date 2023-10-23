import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';
import { getBuildDirPath } from '../../util/script';

function onCustomControlError(params) {
    // eslint-disable-next-line no-console
    console.error(
        `[Custom Control] Something went wrong while calling ${params.methodName}. Error: ${params.error?.name} ${params.error?.message}`
    );
}

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
            this.customControl = new Control(
                globalConfig,
                this.props.serviceName,
                this.el,
                this.props.row,
                this.props.field
            );
            this.setState({ loading: false });
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.row !== nextProps.row) {
            return true;
        }
        if (!nextState.loading && this.shouldRender) {
            this.shouldRender = false;
            return true;
        }
        return false;
    }

    loadCustomControl = () =>
        new Promise((resolve) => {
            if (this.props.type === 'external') {
                import(
                    /* webpackIgnore: true */ `${getBuildDirPath()}/custom/${
                        this.props.fileName
                    }.js`
                ).then((external) => {
                    const Control = external.default;
                    resolve(Control);
                });
            } else {
                const globalConfig = getUnifiedConfigs();
                const appName = globalConfig.meta.name;
                __non_webpack_require__(
                    [`app/${appName}/js/build/custom/${this.props.fileName}`],
                    (Control) => resolve(Control)
                );
            }
        });

    render() {
        if (!this.state.loading) {
            try {
                this.customControl.render(this.props.row, this.props.field);
            } catch (error) {
                onCustomControlError({ methodName: 'render', error });
            }
        }
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
    type: PropTypes.string,
};

export default CustomTableControl;
