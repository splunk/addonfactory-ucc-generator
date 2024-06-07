import React from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import QuestionCircle from '@splunk/react-icons/QuestionCircle';

import { StyledButton } from '../../pages/EntryPageStyle';
import { getUnifiedConfigs } from '../../util/util';

const ModalWrapper = styled(Modal)`
    width: 700px;
`;

interface DashboardInfoModalProps {
    open: boolean;
    title: string;
    subtitle?: string;
    handleRequestClose: () => void;
    errorTypesInfo: { header: string; description: string }[];
    closeBtnLabel?: string;
    infoMessage?: string;
    listIntroductionText?: string;
    troubleshootingButton?: { label?: string; link?: string };
}

function DashboardInfoModal(props: DashboardInfoModalProps) {
    const globalConfig = getUnifiedConfigs();
    return (
        <ModalWrapper open={props.open}>
            <Modal.Header
                onRequestClose={() => props.handleRequestClose()}
                title={props.title}
                subtitle={props.subtitle}
            />
            <Modal.Body>
                {props?.infoMessage ? (
                    <Message appearance="fill" type="info">
                        {props.infoMessage}
                    </Message>
                ) : null}
                {props?.listIntroductionText ? <P>{props.listIntroductionText}</P> : null}
                {props.errorTypesInfo.map((typeInfo) => (
                    <>
                        <Heading level={4}>{typeInfo.header}</Heading>
                        <P>{typeInfo.description}</P>
                    </>
                ))}
            </Modal.Body>
            <Modal.Footer>
                {globalConfig.pages.dashboard?.panels[0].name ? ( // to do change it into troubleshooting link
                    <StyledButton
                        icon={<QuestionCircle width={16} height={16} />}
                        to={globalConfig.pages.dashboard?.panels[0].name}
                        label={props.troubleshootingButton?.label || 'Troubleshooting {add-on}'}
                        openInNewContext
                    />
                ) : null}
                <StyledButton
                    appearance="primary"
                    onClick={() => props.handleRequestClose()}
                    label={props.closeBtnLabel || 'Close'}
                />
            </Modal.Footer>
        </ModalWrapper>
    );
}

export default DashboardInfoModal;
