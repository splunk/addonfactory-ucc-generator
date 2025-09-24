import React, { ReactElement } from 'react';
import { gettext } from '@splunk/ui-utils/i18n';
import SearchIcon from '@splunk/react-icons/enterprise/Search';
import File from '@splunk/react-icons/File';
import Card from '@splunk/react-ui/Card';
import { parseErrorMsg } from '../../util/messageUtil';
import { getSearchUrl } from '../../util/searchUtil';
import { getUnifiedConfigs } from '../../util/util';
import {
    ErrorDetailsContainer,
    LinkContent,
    LinkDescription,
    LinkIcon,
    LinkItem,
    LinksSection,
    PStyled,
    SectionTitle,
    StyledCard,
    StyledCollapsiblePanel,
    StyledContainer,
    StyledHeader,
    StyledHeading,
    StyledLink,
    StyledWarningIcon,
} from './ErrorBoundary.style';

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
        this.state = {
            error: null,
        };
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
                        <StyledHeader>
                            <div>
                                <StyledWarningIcon />
                                <StyledHeading level={1}>
                                    {gettext('Something went wrong')}
                                </StyledHeading>
                            </div>
                            <PStyled>
                                {gettext(
                                    'An unexpected error occurred while loading this component'
                                )}
                            </PStyled>
                        </StyledHeader>

                        <Card.Body>
                            {parsedErrorMessage && (
                                <StyledCollapsiblePanel
                                    defaultOpen
                                    title={gettext('Error Details')}
                                >
                                    <ErrorDetailsContainer>
                                        {parsedErrorMessage}
                                    </ErrorDetailsContainer>
                                </StyledCollapsiblePanel>
                            )}

                            <LinksSection>
                                <SectionTitle>{gettext('Troubleshooting Resources')}</SectionTitle>
                                <LinkItem>
                                    <LinkIcon>
                                        <SearchIcon />
                                    </LinkIcon>
                                    <LinkContent>
                                        <StyledLink
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
                                        </StyledLink>
                                        <LinkDescription>
                                            Find errors related to your current Technical Add-on
                                            inputs and configuration
                                        </LinkDescription>
                                    </LinkContent>
                                </LinkItem>
                                <LinkItem>
                                    <LinkIcon>
                                        <File />
                                    </LinkIcon>
                                    <LinkContent>
                                        <StyledLink
                                            to="https://splunk.github.io/addonfactory-ucc-generator/troubleshooting/"
                                            target="_blank"
                                            openInNewContext
                                            rel="noopener noreferrer"
                                        >
                                            UCC Troubleshooting Guide
                                        </StyledLink>
                                        <LinkDescription>
                                            Comprehensive documentation with step-by-step
                                            troubleshooting instructions
                                        </LinkDescription>
                                    </LinkContent>
                                </LinkItem>
                                <LinkItem>
                                    <LinkIcon>
                                        <SearchIcon />
                                    </LinkIcon>
                                    <LinkContent>
                                        <StyledLink
                                            // query from /troubleshooting/ section
                                            to={getSearchUrl({
                                                q: 'index = _internal source=*splunkd* ERROR',
                                            }).toString()}
                                            target="_blank"
                                            openInNewContext
                                            rel="noopener noreferrer"
                                        >
                                            Search All Splunk Errors
                                        </StyledLink>
                                        <LinkDescription>
                                            Search across your entire Splunk instance for related
                                            issues
                                        </LinkDescription>
                                    </LinkContent>
                                </LinkItem>
                            </LinksSection>
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
