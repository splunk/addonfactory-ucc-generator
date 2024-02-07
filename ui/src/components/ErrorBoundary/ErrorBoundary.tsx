import React, { ReactElement } from 'react';
import Heading from '@splunk/react-ui/Heading';
import { _ } from '@splunk/ui-utils/i18n';
import Card from '@splunk/react-ui/Card';
import WarningIcon from '@splunk/react-icons/enterprise/Warning';
import errorCodes from '../../constants/errorCodes';

interface ErrorBoundaryProps {
    children: ReactElement | ReactElement[];
}

interface ErrorBoundaryState {
    errorCode: keyof typeof errorCodes | null;
    error: null | unknown;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { errorCode: null, error: null };
    }

    static getDerivedStateFromError(error: { uccErrorCode: unknown }) {
        // Update state so the next render will show the fallback UI.
        return { errorCode: error.uccErrorCode, error };
    }

    componentDidCatch(error: unknown) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
        });
        // You can also log error messages to an error reporting service here
    }

    render() {
        if (this.state.error) {
            // Error path
            return (
                <div style={{ marginTop: '10%' }}>
                    <Card style={{ boxShadow: '10px 10px 5px #aaaaaa' }}>
                        <Card.Header>
                            <Heading style={{ textAlign: 'center' }} level={2}>
                                <WarningIcon style={{ fontSize: '120px', color: '#ff9900' }} />
                                <br />
                                <br />
                                {this.state.errorCode === 'ERR0001'
                                    ? _('Failed to load Inputs Page')
                                    : _('Something went wrong!')}
                            </Heading>
                        </Card.Header>
                        <Card.Body>
                            {this.state.errorCode ? (
                                <>
                                    {_(errorCodes[this.state.errorCode])}
                                    <br />
                                    <br />
                                </>
                            ) : null}
                            <details style={{ whiteSpace: 'pre-wrap' }}>
                                {this.state.error?.toString()}
                            </details>
                        </Card.Body>
                        <Card.Footer showBorder={false}>
                            {this.state.errorCode ? this.state.errorCode : null}
                        </Card.Footer>
                    </Card>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
