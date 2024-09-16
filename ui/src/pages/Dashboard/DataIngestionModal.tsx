import Modal from '@splunk/react-ui/Modal';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { variables } from '@splunk/themes';
import Button from '@splunk/react-ui/Button';
import { StyledButton } from '../EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 60vw;
    height: 80vh;
    margin-top: 3vh;
`;

const ModalHeader = styled(Modal.Header)`
    background-color: ${variables.neutral200};
`;

const ModalFooter = styled(Modal.Footer)`
    background-color: ${variables.neutral200};
`;

const ModalBody = styled(Modal.Body)`
    background-color: ${variables.neutral200};
`;

const FooterButtonGroup = styled('div')`
    display: grid;
    grid-template-columns: 0.35fr 1fr;
    margin: 0px ${variables.spacingSmall};

    .footerBtn:first-child {
        justify-self: start;
    }

    .footerBtn:last-child {
        justify-self: end;
    }
`;

export const DataIngestionModal = ({
    open = false,
    handleRequestClose,
    title,
    acceptBtnLabel = 'Done',
    children,
}: {
    open?: boolean;
    handleRequestClose: () => void;
    title?: string;
    acceptBtnLabel?: string;
    children: ReactElement;
}) => (
    <ModalWrapper open={open}>
        <ModalHeader onRequestClose={handleRequestClose} title={title} />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
            <FooterButtonGroup>
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
                    onClick={handleRequestClose}
                    label={acceptBtnLabel}
                />
            </FooterButtonGroup>
        </ModalFooter>
    </ModalWrapper>
);
