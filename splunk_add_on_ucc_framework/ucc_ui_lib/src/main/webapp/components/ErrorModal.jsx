import React,  { useState } from 'react';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import PropTypes from 'prop-types';

import {getFormattedMessage} from '../util/messageUtil';

function ErrorModal(props) {

    const [open, setOpen] = useState(props.open);

    const handleRequestClose = () => {
        setOpen(false);
    };

    return (
        <Modal
            onRequestClose={handleRequestClose}
            open={open}
            style={{ width: '600px' }}
        >
            <Modal.Header
                onRequestClose={handleRequestClose}
                title={getFormattedMessage(104)}
            />
            <Modal.Body>
                <Message appearance="fill" type="error">
                    {props.message}
                </Message>
            </Modal.Body>
            <Modal.Footer>
                <Button appearance="primary" onClick={handleRequestClose} label="OK" />
            </Modal.Footer>
        </Modal>
    );
}
ErrorModal.propTypes = {
    message: PropTypes.string,
    open: PropTypes.string,
};
export default ErrorModal;