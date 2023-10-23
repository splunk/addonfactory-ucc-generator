import React from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import { StyledButton } from '../pages/EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 600px;
`;

interface AcceptModalProps {
    title: string;
    open: boolean;
    handleRequestClose: (accepted: boolean) => void;
    message?: string;
    declineBtnLabel?: string;
    acceptBtnLabel?: string;
}

function AcceptModal(props: AcceptModalProps) {
    return (
        <ModalWrapper open={props.open}>
            <Modal.Header
                onRequestClose={() => props.handleRequestClose(false)}
                title={props.title}
            />
            <Modal.Body>
                <Message appearance="fill" type="warning">
                    {props.message}
                </Message>
            </Modal.Body>
            <Modal.Footer>
                <StyledButton
                    appearance="primary"
                    onClick={() => props.handleRequestClose(false)}
                    label={props.declineBtnLabel || 'Cancel'}
                />
                <StyledButton
                    appearance="primary"
                    onClick={() => props.handleRequestClose(true)}
                    label={props.acceptBtnLabel || 'OK'}
                />
            </Modal.Footer>
        </ModalWrapper>
    );
}

export default AcceptModal;
