import Heading from '@splunk/react-ui/Heading';
import Card from '@splunk/react-ui/Card';
import WarningIcon from '@splunk/react-icons/enterprise/Warning';
import styled, { keyframes } from 'styled-components';
import Link from '@splunk/react-ui/Link';
import Button from '@splunk/react-ui/Button';
import variables from '@splunk/themes/variables';
import pick from '@splunk/themes/pick';

// Animations
export const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const pulse = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`;

// Styled Components
export const StyledContainer = styled.div`
    display: flex;
    justify-content: center; // Ensures horizontal centering of children
    align-items: center; // Ensures vertical centering
    width: 100%; // Takes up full width of its parent
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

export const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
    box-shadow: ${variables.overlayShadow}, 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 35rem;
    max-width: 50rem;
    border-radius: ${variables.spacingHalf};
    overflow: hidden;
    border: 1px solid #e0e4e7;
    background: ${pick({
        enterprise: {
            light: variables.interactiveColorBackground,
            dark: variables.interactiveColorBackground,
        },
    })};
`;

export const StyledHeader = styled(Card.Header)`
    background: ${pick({
        enterprise: {
            light: variables.errorColor,
            dark: variables.errorColor,
        },
    })};
    color: white;
    padding: 2rem;
    text-align: center;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const StyledHeading = styled(Heading)`
    text-align: center;
    color: white;
    margin: 0;
    font-weight: ${variables.fontWeightBold};
`;

export const StyledWarningIcon = styled(WarningIcon)`
    font-size: 4rem;
    color: white;
    margin-bottom: 1rem;
    animation: ${pulse} 2s infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

export const StyledBody = styled(Card.Body)`
    padding: 2rem;
    background: ${pick({
        enterprise: {
            light: variables.backgroundColorFloating,
            dark: variables.backgroundColorFloating,
        },
    })};
`;

export const ErrorDetailsContainer = styled.div`
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: ${pick({
        enterprise: {
            light: variables.black,
            dark: variables.black,
        },
    })};

    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
`;

export const LinksSection = styled.div`
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e9ecef;
`;

export const LinkItem = styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #007bff;
    transition: all 0.3s ease;

    &:hover {
        background: #e9ecef;
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

export const LinkIcon = styled.div`
    margin-right: 1rem;
    color: #007bff;
    font-size: 1.25rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
`;

export const LinkContent = styled.div`
    flex: 1;
`;

export const StyledLink = styled(Link)`
    font-weight: 600;
    color: #007bff;
    text-decoration: none;
    font-size: 1rem;

    &:hover {
        color: #0056b3;
        text-decoration: underline;
    }
`;

export const LinkDescription = styled.p`
    margin: 0.5rem 0 0 0;
    color: #6c757d;
    font-size: 0.875rem;
    line-height: 1.4;
`;

export const ToggleButton = styled(Button)`
    margin-top: 1rem;
    font-size: 0.875rem;
`;

export const SectionTitle = styled.h3`
    color: #495057;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;

    &:before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 1.5rem;
        background: #007bff;
        margin-right: 0.75rem;
        border-radius: 2px;
    }
`;

export const PStyled = styled.p`
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0.5rem 0 0 0',
    fontSize: '1rem',
`;
