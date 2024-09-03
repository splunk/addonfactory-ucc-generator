import Modal from '@splunk/react-ui/Modal';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { variables } from '@splunk/themes';
import Button from '@splunk/react-ui/Button';
import { StyledButton } from '../EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 60%;
    height: 80%;
    margin-top: 4vh;
`;

const ModalHeader = styled(Modal.Header)`
    background-color: ${variables.backgroundColorHover};
`;
const ModalFooter = styled(Modal.Footer)`
    background-color: ${variables.backgroundColorHover};
`;
const ModalBody = styled(Modal.Body)`
    background-color: ${variables.backgroundColorHover};
`;

const StyledDiv = styled('div')`
    display: grid;
    grid-template-columns: 0.35fr 1fr;
    margin: 0px 10px;

    .footerBtn:first-child {
        justify-self: start;
    }

    .footerBtn:last-child {
        justify-self: end;
    }
`;

export const DataIngestionModal = (props: {
    open: boolean | undefined;
    handleRequestClose: () => void;
    title: string | undefined;
    acceptBtnLabel: string;
    children: ReactElement;
}) => (
    <ModalWrapper open={props.open}>
        <ModalHeader onRequestClose={props.handleRequestClose} title={props.title} />
        <ModalBody>{props.children}</ModalBody>
        <ModalFooter>
            <StyledDiv>
                <Button
                    id="open_search_error_events_tab_with_types"
                    label="View ingested events in search"
                    openInNewContext
                    onClick={() =>
                        (
                            document.querySelector(
                                '#data_ingestion_modal_events_count_viz [data-test="open-search-button"]'
                            ) as HTMLElement
                        )?.click()
                    }
                />
                <StyledButton
                    className="footerBtn"
                    appearance="primary"
                    onClick={props.handleRequestClose}
                    label={props.acceptBtnLabel || 'Done'}
                />
            </StyledDiv>
        </ModalFooter>
    </ModalWrapper>
);
