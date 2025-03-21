import React, { ComponentProps } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';

import { UCCButton } from '../UCCButton/UCCButton';

const ModalWrapper = styled(Modal)`
    width: 600px;
`;

interface AcceptModalProps {
    title: string;
    open: boolean;
    handleRequestClose: (accepted: boolean) => void;
    returnFocus: ComponentProps<typeof Modal>['returnFocus'];
    message?: string;
    declineBtnLabel?: string;
    acceptBtnLabel?: string;
}

function AcceptModal(props: AcceptModalProps) {
    return (
        <ModalWrapper
            returnFocus={props.returnFocus}
            open={props.open}
            onRequestClose={() => props.handleRequestClose(false)}
        >
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
                <UCCButton
                    onClick={() => props.handleRequestClose(false)}
                    label={props.declineBtnLabel || 'Cancel'}
                />
                <UCCButton
                    onClick={() => props.handleRequestClose(true)}
                    label={props.acceptBtnLabel || 'OK'}
                />
            </Modal.Footer>
        </ModalWrapper>
    );
}

export default AcceptModal;
