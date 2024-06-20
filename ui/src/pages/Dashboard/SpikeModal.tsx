import Modal from '@splunk/react-ui/Modal';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { StyledButton } from '../EntryPageStyle';

const ModalWrapper = styled(Modal)`
    width: 80%;
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
            <StyledButton
                appearance="primary"
                onClick={props.handleRequestClose}
                label={props.acceptBtnLabel || 'OK'}
            />
        </Modal.Footer>
    </ModalWrapper>
);
