import React, { Component } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import update from 'immutability-helper';
import { _ } from '@splunk/ui-utils/i18n';
import { generateToast } from '../../util/util';
import { StyledButton } from '../../pages/EntryPageStyle';

import { axiosCallWrapper } from '../../util/axiosCallWrapper';
import TableContext from '../../context/TableContext';
import { parseErrorMsg, getFormattedMessage } from '../../util/messageUtil';
import { PAGE_INPUT } from '../../constants/pages';

const ModalWrapper = styled(Modal)`
    width: 800px;
`;

interface DeleteModalProps {
    page: string;
    handleRequestClose: () => void;
    serviceName: string;
    stanzaName: string;
    open?: boolean;
}

interface DeleteModalState {
    isDeleting: boolean;
    ErrorMsg: string;
}

class DeleteModal extends Component<DeleteModalProps, DeleteModalState> {
    static contextType = TableContext;

    constructor(props: DeleteModalProps) {
        super(props);
        this.state = { isDeleting: false, ErrorMsg: '' };
    }

    handleRequestClose = () => {
        // set ErrorMsg to empty string on close or cancel
        // so that on again open of modal it does not show the same ErrorMsg
        this.setState((prevState) => ({ ...prevState, ErrorMsg: '' }));

        this.props.handleRequestClose();
    };

    handleDelete = () => {
        this.setState(
            (prevState) => ({ ...prevState, isDeleting: true, ErrorMsg: '' }),
            () => {
                axiosCallWrapper({
                    serviceName: `${this.props.serviceName}/${encodeURIComponent(
                        this.props.stanzaName
                    )}`,
                    customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    method: 'delete',
                    handleError: false,
                })
                    .catch((err) => {
                        const errorSubmitMsg = parseErrorMsg(err);
                        this.setState({ ErrorMsg: errorSubmitMsg, isDeleting: false });
                        return Promise.reject(err);
                    })
                    .then(() => {
                        this.context?.setRowData(
                            update(this.context.rowData, {
                                [this.props.serviceName]: { $unset: [this.props.stanzaName] },
                            })
                        );
                        this.setState({ isDeleting: false });
                        this.handleRequestClose();
                        generateToast(`Deleted "${this.props.stanzaName}"`, 'success');
                    });
            }
        );
    };

    // Display error message
    generateErrorMessage = () => {
        if (this.state.ErrorMsg) {
            return (
                <div>
                    <Message appearance="fill" type="error">
                        {this.state.ErrorMsg}
                    </Message>
                </div>
            );
        }
        return null;
    };

    render() {
        let deleteMsg;
        if (this.props.page === PAGE_INPUT) {
            deleteMsg = getFormattedMessage(103, [this.props.stanzaName]);
        } else {
            deleteMsg = getFormattedMessage(102, [this.props.stanzaName]);
        }
        return (
            <ModalWrapper open={this.props.open}>
                <Modal.Header
                    title={getFormattedMessage(101)}
                    onRequestClose={this.handleRequestClose}
                />
                <Modal.Body className="deletePrompt">
                    {this.generateErrorMessage()}
                    <p>{deleteMsg}</p>
                </Modal.Body>
                <Modal.Footer>
                    <StyledButton
                        appearance="secondary"
                        onClick={this.handleRequestClose}
                        label={_('Cancel')}
                        disabled={this.state.isDeleting}
                    />
                    <StyledButton
                        appearance="primary"
                        label={this.state.isDeleting ? <WaitSpinner /> : _('Delete')}
                        onClick={this.handleDelete}
                        disabled={this.state.isDeleting}
                    />
                </Modal.Footer>
            </ModalWrapper>
        );
    }
}

export default DeleteModal;
