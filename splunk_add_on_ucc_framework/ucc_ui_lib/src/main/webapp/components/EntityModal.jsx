import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { _ } from '@splunk/ui-utils/i18n';

import { MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../constants/modes';
import BaseFormView from './BaseFormView';

const ModalWrapper = styled(Modal)`
    width: 800px;
`;

class EntityModal extends Component {
    constructor(props) {
        super(props);
        this.form = React.createRef();
        this.state = { isSubmititng: false };

        if (props.mode === MODE_CREATE) {
            this.buttonText = _('Add');
        } else if (props.mode === MODE_CLONE) {
            this.buttonText = _('Save');
        } else if (props.mode === MODE_EDIT) {
            this.buttonText = _('Update');
        } else {
            this.buttonText = _('Submit');
        }
    }

    handleRequestClose = () => {
        this.props.handleRequestClose();
    };

    handleSubmit = () => {
        const result = this.form.current.handleSubmit();
        if (result) {
            this.handleRequestClose();
        }
    };

    handleFormSubmit = (set, close) => {
        this.setState({ isSubmititng: set });
        if (close) {
            this.handleRequestClose();
        }
    };

    render() {
        return (
            <div>
                <ModalWrapper open={this.props.open}>
                    <Modal.Header
                        title={this.props.formLabel}
                        onRequestClose={this.handleRequestClose}
                    />
                    <Modal.Body>
                        <BaseFormView
                            ref={this.form}
                            page={this.props.page}
                            serviceName={this.props.serviceName}
                            mode={this.props.mode}
                            stanzaName={this.props.stanzaName}
                            handleFormSubmit={this.handleFormSubmit}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            appearance="secondary"
                            onClick={this.handleRequestClose}
                            label={_('Cancel')}
                        />
                        <Button
                            appearance="primary"
                            label={this.state.isSubmititng ? <WaitSpinner /> : this.buttonText}
                            onClick={this.handleSubmit}
                            disabled={this.state.isSubmititng}
                        />
                    </Modal.Footer>
                </ModalWrapper>
            </div>
        );
    }
}

EntityModal.propTypes = {
    page: PropTypes.string,
    open: PropTypes.bool,
    handleRequestClose: PropTypes.func,
    serviceName: PropTypes.string,
    mode: PropTypes.string,
    stanzaName: PropTypes.string,
    formLabel: PropTypes.string,
};

export default EntityModal;
