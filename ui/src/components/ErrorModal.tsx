import React, { useState } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';

import { getFormattedMessage } from '../util/messageUtil';
import { StyledButton } from '../pages/EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 600px;
`;

interface ErrorModalProps {
    message: string;
    open: boolean;
}

function ErrorModal(props: ErrorModalProps) {
    const [open, setOpen] = useState(props.open); // nosemgrep: typescript.react.best-practice.react-props-in-state.react-props-in-state

    const handleRequestClose = () => {
        setOpen(false);
    };

    return (
        <ModalWrapper open={open}>
            <Modal.Header onRequestClose={handleRequestClose} title={getFormattedMessage(104)} />
            <Modal.Body>
                <Message appearance="fill" type="error">
                    {props.message}
                </Message>
            </Modal.Body>
            <Modal.Footer>
                <StyledButton appearance="primary" onClick={handleRequestClose} label="OK" />
            </Modal.Footer>
        </ModalWrapper>
    );
}

export default ErrorModal;
