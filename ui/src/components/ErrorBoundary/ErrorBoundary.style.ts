import Heading from '@splunk/react-ui/Heading';
import Card from '@splunk/react-ui/Card';
import WarningIcon from '@splunk/react-icons/enterprise/Warning';
import styled, { keyframes } from 'styled-components';
import Link from '@splunk/react-ui/Link';
import variables from '@splunk/themes/variables';
import pick from '@splunk/themes/pick';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';

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

// Styled Components
export const StyledContainer = styled.div`
    display: flex;
    justify-content: center; // Ensures horizontal centering of children
    align-items: center; // Ensures vertical centering
    width: 100%; // Takes up full width of its parent
    animation: ${fadeIn} 0.6s ease-out;
`;

export const StyledCard = styled(Card)`
    display: flex;
    flex-direction: column;
    box-shadow: ${variables.overlayShadow};
    min-width: 35rem;
    max-width: 50rem;
    border-radius: ${variables.borderRadius};
    overflow: hidden;
`;

export const StyledHeader = styled(Card.Header)`
    color: ${variables.contentColorActive};
    text-align: center;
    border-bottom: none;
    padding: ${variables.spacingLarge};
    padding-bottom: 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const StyledWarningIcon = styled(WarningIcon)`
    font-size: 4rem;
    margin: ${variables.spacingMedium} 0;
    color: ${pick({
        enterprise: {
            light: variables.alertColor,
            dark: variables.alertColor,
        },
        prisma: {
            light: variables.accentColorWarning,
            dark: variables.accentColorWarning,
        },
    })};
`;

export const StyledHeading = styled(Heading)`
    text-align: center;
    margin: 0;
    font-weight: ${variables.fontWeightBold};
`;

export const StyledBody = styled(Card.Body)`
    padding: ${variables.spacingXLarge};
    padding-top: ${variables.spacingXXLarge};
`;

export const StyledCollapsiblePanel = styled(CollapsiblePanel)`
    margin-top: ${variables.spacingLarge};

    button {
        background: ${pick({
            enterprise: {
                light: variables.neutral200,
                dark: variables.neutral300,
            },
        })};
    }
`;

export const ErrorDetailsContainer = styled.div`
    background: ${pick({
        enterprise: {
            light: variables.backgroundColorHover,
            dark: variables.backgroundColorHover,
        },
        prisma: {
            light: variables.backgroundColorPage,
            dark: variables.backgroundColorSection,
        },
    })};
    border: 1px solid
        ${pick({
            enterprise: {
                light: variables.borderColor,
                dark: variables.borderActiveColor,
            },
            prisma: {
                light: variables.borderColor,
                dark: variables.borderActiveColor,
            },
        })};
    color: ${pick({
        enterprise: {
            light: variables.black,
            dark: variables.white,
        },
        prisma: {
            light: variables.contentColorActive,
            dark: variables.contentColorDefault,
        },
    })};
    border-radius: ${variables.borderRadius};
    padding: ${variables.spacingLarge};
    margin: ${variables.spacingLarge} 0;
    font-size: ${variables.fontSizeSmall};
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
`;

export const LinksSection = styled.div`
    margin-top: ${variables.spacingLarge};
    padding-top: ${variables.spacingMedium};
    border-top: 1px solid
        ${pick({
            enterprise: {
                light: variables.gray30,
                dark: variables.gray45,
            },
            prisma: {
                light: variables.gray92,
                dark: variables.gray45,
            },
        })};
`;

export const LinkItem = styled.div`
    display: flex;
    align-items: flex-start;
    padding: ${variables.spacingMedium};
    cursor: pointer;
    position: relative;

    &:hover {
        background: ${pick({
            enterprise: {
                light: variables.backgroundColorHover,
                dark: variables.backgroundColorHover,
            },
            prisma: {
                light: variables.backgroundColorPage,
                dark: variables.backgroundColorPopup,
            },
        })};
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

export const LinkIcon = styled.div`
    margin-right: ${variables.spacingMedium};
    color: ${pick({
        enterprise: {
            light: variables.statusColorInfo,
            dark: variables.statusColorInfo,
        },
        prisma: {
            light: variables.accentColor,
            dark: variables.accentColor,
        },
    })};
    font-size: 1.25rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
`;

export const LinkContent = styled.div`
    flex: 1;
`;

export const StyledLink = styled(Link)`
    font-weight: ${variables.fontWeightSemiBold};
    text-decoration: none;
    font-size: ${variables.fontSize};

    &:hover {
        color: ${pick({
            enterprise: {
                light: variables.accentColorD30,
                dark: variables.accentColorL20,
            },
            prisma: {
                light: variables.accentColorD30,
                dark: variables.accentColorL20,
            },
        })};
        text-decoration: underline;
    }
`;

export const LinkDescription = styled.p`
    margin: ${variables.spacingSmall} 0 0 0;
    color: ${pick({
        enterprise: {
            light: variables.gray45,
            dark: variables.gray80,
        },
        prisma: {
            light: variables.gray45,
            dark: variables.gray80,
        },
    })};
    font-size: ${variables.fontSizeSmall};
    line-height: ${variables.lineHeight};
`;

export const SectionTitle = styled.h3`
    font-size: ${variables.fontSizeLarge};
    font-weight: ${variables.fontWeightSemiBold};
    margin-bottom: ${variables.spacingMedium};
    display: flex;
    align-items: center;
`;

export const PStyled = styled.p`
    font-size: ${variables.fontSizeSmall};
`;
