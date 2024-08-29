import Modal from '@splunk/react-ui/Modal';
import React, { ReactElement } from 'react';
import styled from 'styled-components';
// import Button from '@splunk/react-ui/Button';

import { StyledButton } from '../EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 60%;
    height: 80%;
    margin-top: 4vh;
`;

const StyledDiv = styled('div')`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-content: space-between;
    margin: 0px 10px;

    .footerBtn:first-child {
        justify-self: start;
    }

    .footerBtn:last-child {
        justify-self: end;
    }
`;

export const SpikeModal = (props: {
    open: boolean | undefined;
    handleRequestClose: () => void;
    title: string | undefined;
    acceptBtnLabel: string;
    children: ReactElement;
}) => (
    <ModalWrapper open={props.open}>
        <Modal.Header onRequestClose={props.handleRequestClose} title={props.title} />
        <Modal.Body>{props.children}</Modal.Body>
        <Modal.Footer>
            <StyledDiv>
                <StyledButton
                    className="footerBtn"
                    appearance="default"
                    to="/app/search/search?q=search%20index%3D_internal%20source%3D"
                    target="_blank"
                    openInNewContext
                    label="View events in search"
                />
                <StyledButton
                    className="footerBtn"
                    appearance="primary"
                    onClick={props.handleRequestClose}
                    label={props.acceptBtnLabel || 'Done'}
                />
            </StyledDiv>
        </Modal.Footer>
    </ModalWrapper>
);
