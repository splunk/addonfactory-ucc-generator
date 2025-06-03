import React, { ReactElement } from 'react';
import { gettext } from '@splunk/ui-utils/i18n';
import InfoIcon from '@splunk/react-icons/enterprise/Info';
import SearchIcon from '@splunk/react-icons/enterprise/Search';
import File from '@splunk/react-icons/File';
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
    StyledBody,
    StyledCard,
    StyledContainer,
    StyledHeader,
    StyledHeading,
    StyledLink,
    StyledWarningIcon,
    ToggleButton,
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
    showDetails: boolean;
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
            showDetails: false,
        };
    }

    static getDerivedStateFromError(error: unknown) {
        // Update state so the next render will show the fallback UI.
        return { error, showDetails: false };
    }

    componentDidCatch(error: unknown) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
            showDetails: false,
        });
        // eslint-disable-next-line no-console
        console.error(error);
    }

    toggleDetails = () => {
        this.setState((prevState) => ({
            showDetails: !prevState.showDetails,
        }));
    };

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
                                <StyledHeading>{gettext('Something went wrong')}</StyledHeading>
                            </div>
                            <PStyled>
                                {gettext(
                                    'An unexpected error occurred while loading this component'
                                )}
                            </PStyled>
                        </StyledHeader>

                        <StyledBody>
                            {parsedErrorMessage && (
                                <>
                                    <ToggleButton
                                        appearance="secondary"
                                        onClick={this.toggleDetails}
                                        icon={<InfoIcon />}
                                    >
                                        {this.state.showDetails
                                            ? 'Hide Error Details'
                                            : 'Show Error Details'}
                                    </ToggleButton>

                                    {this.state.showDetails && (
                                        <ErrorDetailsContainer>
                                            {parsedErrorMessage}
                                        </ErrorDetailsContainer>
                                    )}
                                </>
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
                        </StyledBody>
                    </StyledCard>
                </StyledContainer>
            );
        }

        // Normally, just render children
        return this.props.children;
    }
}

export default ErrorBoundary;
