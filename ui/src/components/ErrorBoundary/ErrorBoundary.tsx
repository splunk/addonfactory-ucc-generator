import React, { ReactElement } from 'react';
import Heading from '@splunk/react-ui/Heading';
import { gettext } from '@splunk/ui-utils/i18n';
import Card from '@splunk/react-ui/Card';
import WarningIcon from '@splunk/react-icons/enterprise/Warning';
import styled from 'styled-components';
import { variables } from '@splunk/themes';
import P from '@splunk/react-ui/Paragraph';
import Link from '@splunk/react-ui/Link';

import { parseErrorMsg } from '../../util/messageUtil';
import { getSearchUrl } from '../../util/searchUtil';
import { getUnifiedConfigs } from '../../util/util';

interface ErrorBoundaryProps {
    children: ReactElement | ReactElement[];
}

interface ErrorBoundaryState {
    error:
        | {
              response?: {
                  data?: {
                      messages?: { text: string }[];
                  };
              };
          }
        | null
        | unknown;
}

const StyledContainer = styled.div`
    display: flex;
    justify-content: center; // Ensures horizontal centering of children
    align-items: center; // Ensures vertical centering
    width: 100%; // Takes up full width of its parent
`;

const StyledCard = styled(Card)`
    display: flex;
    flex: 0;
    box-shadow: ${variables.overlayShadow};
    min-width: 30rem;
`;

const StyledHeading = styled(Heading)`
    text-align: center;
`;

const StyledWarningIcon = styled(WarningIcon)`
    font-size: 120px;
    color: ${variables.alertColor};
`;

const StyledTypography = styled.details`
    white-space: pre-wrap;
    word-break: break-word;
`;

export const getRestrictQueryByAllServices = () => {
    const globalConfig = getUnifiedConfigs();
    const listOfServices = globalConfig.pages.inputs?.services.map((service) => service.name);
    if (!listOfServices || listOfServices?.length === 0) {
        return gettext('');
    }
    const listOfServicesString = listOfServices?.join('*, ');
    return `(scheme IN (${listOfServicesString})`;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: unknown) {
        // Update state so the next render will show the fallback UI.
        return { error };
    }

    componentDidCatch(error: unknown) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
        });
        // eslint-disable-next-line no-console
        console.error(error);
    }

    render() {
        if (this.state.error) {
            const parsedErrorMessage = parseErrorMsg(this.state?.error);
            // Error path
            return (
                <StyledContainer>
                    <StyledCard>
                        <Card.Header>
                            <StyledHeading level={2}>
                                <StyledWarningIcon />
                                <StyledTypography as="p">
                                    {gettext('Something went wrong!')}
                                </StyledTypography>
                            </StyledHeading>
                        </Card.Header>
                        <Card.Body>
                            {parsedErrorMessage && (
                                <StyledTypography as="p">{parsedErrorMessage}</StyledTypography>
                            )}
                            <>
                                <P>Useful Links:</P>
                                <P>
                                    <Link
                                        // detailed query from /troubleshooting/ section
                                        to={getSearchUrl({
                                            q: `index = _internal source=*splunkd* 
(
    (component=ModularInputs stderr)
    OR component=ExecProcessor ${getRestrictQueryByAllServices()})
) 
OR component="PersistentScript"`,
                                        }).toString()}
                                        target="_blank"
                                        openInNewContext
                                        rel="noopener noreferrer"
                                    >
                                        Error Splunk Search
                                    </Link>
                                    <span>
                                        {' '}
                                        - Search for errors connected to inputs of current TA and
                                        configuration
                                    </span>
                                </P>
                                <P>
                                    <Link
                                        to="https://splunk.github.io/addonfactory-ucc-generator/troubleshooting/"
                                        target="_blank"
                                        openInNewContext
                                        rel="noopener noreferrer"
                                    >
                                        Troubleshooting
                                    </Link>
                                    <span> - Documentation describing next steps </span>
                                </P>

                                <P>
                                    <Link
                                        // query from /troubleshooting/ section
                                        to={getSearchUrl({
                                            q: 'index = _internal source=*splunkd* ERROR',
                                        }).toString()}
                                        target="_blank"
                                        openInNewContext
                                        rel="noopener noreferrer"
                                    >
                                        General Error Splunk Search
                                    </Link>
                                    <span> - Search for all errors in whole Splunk instance </span>
                                </P>
                            </>
                        </Card.Body>
                    </StyledCard>
                </StyledContainer>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
