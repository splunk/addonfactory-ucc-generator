import React, { ReactNode } from 'react';
import styled from 'styled-components';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';

const GroupWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const CollapsiblePanelWrapper = styled(CollapsiblePanel)`
    span {
        button {
            background-color: #f2f4f5;
            font-size: 14px;

            &:hover:not([disabled]),
            &:focus:not([disabled]),
            &:active:not([disabled]) {
                background-color: #f2f4f5;
                box-shadow: none;
            }
        }
    }
`;

const StyledPadding8 = styled.div`
    padding-top: 8px;
    padding-bottom: 8px;
`;

const CustomGroupLabel = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background-color: #f2f4f5;
    font-size: 14px;
    margin-bottom: 10px;
`;

const Description = styled.span`
    padding-right: 20px;
    margin-left: 10px;
    font-size: 12px;
`;

interface GroupProps {
    title: ReactNode;
    description?: string;
    children: ReactNode;
    isExpandable?: boolean;
    defaultOpen?: boolean;
}

function Group({ isExpandable, defaultOpen, children, title, description }: GroupProps) {
    return (
        <GroupWrapper>
            {isExpandable ? (
                <CollapsiblePanelWrapper
                    title={title}
                    defaultOpen={defaultOpen}
                    description={description}
                >
                    <StyledPadding8>{children}</StyledPadding8>
                </CollapsiblePanelWrapper>
            ) : (
                <>
                    <CustomGroupLabel>
                        <span>{title}</span>
                        <Description>{description}</Description>
                    </CustomGroupLabel>
                    <div>{children}</div>
                </>
            )}
        </GroupWrapper>
    );
}

export default Group;
