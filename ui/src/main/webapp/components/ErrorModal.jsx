import React, { useState, useEffect } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { getFormattedMessage } from '../util/messageUtil';
import { StyledButton } from '../pages/EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 600px;
`;

function ErrorModal(props) {
    const [open, setOpen] = useState(props.open); // nosemgrep: typescript.react.best-practice.react-props-in-state.react-props-in-state

    const handleRequestClose = () => {
        setOpen(false);
    };

    // Custom logic to close modal if esc pressed
    useEffect(() => {
        function handleKeyboardEvent(e) {
            if (e && e.keyCode === 27) {
                if (open) handleRequestClose();
            }
        }
        window.addEventListener('keydown', handleKeyboardEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyboardEvent);
        };
    });

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
ErrorModal.propTypes = {
    message: PropTypes.string,
    open: PropTypes.bool,
};
export default ErrorModal;
