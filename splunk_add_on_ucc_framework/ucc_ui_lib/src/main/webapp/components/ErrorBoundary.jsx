import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import Message from '@splunk/react-ui/Message';

import errorCodes from '../constants/errorCodes';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { errorCode: null, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { errorCode: error.ucc_err_code };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
        // You can also log error messages to an error reporting service here
    }

    render() {
        if (this.state.errorCode) {
            // Error path
            return (
                <>
                    <Heading level={2}>
                        Something went wrong! (ERROR_CODE: {this.state.errorCode})
                    </Heading>
                    <Message type="info">{errorCodes[this.state.errorCode]}</Message>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </>
            );
        } else if (this.state.error) {
            return (
                <>
                    <Heading level={2}>Something went wrong!</Heading>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
