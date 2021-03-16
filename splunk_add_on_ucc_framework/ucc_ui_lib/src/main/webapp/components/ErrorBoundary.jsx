import React from 'react';
import PropTypes from 'prop-types';

import Heading from '@splunk/react-ui/Heading';
import Message from '@splunk/react-ui/Message';
import { _ } from '@splunk/ui-utils/i18n';

import errorCodes from '../constants/errorCodes';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { errorCode: null, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { errorCode: error.uccErrorCode };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
            errorInfo,
        });
        // You can also log error messages to an error reporting service here
    }

    render() {
        if (this.state.error) {
            // Error path
            return (
                <>
                    <Heading level={2}>
                        {_('Something went wrong!')}
                        {this.state.errorCode ? ` ERROR_CODE: ${this.state.errorCode}` : null}
                    </Heading>
                    {this.state.errorCode ? (
                        <Message type="info">{errorCodes[this.state.errorCode]}</Message>
                    ) : null}
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.toString()}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                </>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default ErrorBoundary;
