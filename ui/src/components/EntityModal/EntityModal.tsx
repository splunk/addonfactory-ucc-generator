import React, { Component, ComponentProps } from 'react';
import Modal from '@splunk/react-ui/Modal';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';
import { ButtonClickHandler } from '@splunk/react-ui/Button';

import { Mode, MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../../constants/modes';
import BaseFormView from '../BaseFormView/BaseFormView';
import { StandardPages } from '../../types/components/shareableTypes';
import PageContext from '../../context/PageContext';
import { UCCButton } from '../UCCButton/UCCButton';

const ModalWrapper = styled(Modal)`
    width: 800px;
`;

export interface EntityModalProps {
    page: StandardPages;
    mode: Mode;
    serviceName: string;
    handleRequestClose: () => void;
    returnFocus: ComponentProps<typeof Modal>['returnFocus'];
    stanzaName?: string;
    open?: boolean;
    formLabel?: string;
    groupName?: string;
}

interface EntityModalState {
    isSubmititng: boolean;
}

class EntityModal extends Component<EntityModalProps, EntityModalState> {
    form: React.RefObject<BaseFormView>;

    buttonText: string;

    constructor(props: EntityModalProps) {
        super(props);
        // Ref is used here to call submit method of form only
        this.form = React.createRef(); // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
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

    handleSubmit: ButtonClickHandler = async (e) => {
        const result = await this.form.current?.handleSubmit(e);
        if (result) {
            this.handleRequestClose();
        }
    };

    /*
     * @param {boolean} set: whether form is submitting
     * @param {boolean} close : close the Entity modal
     */
    handleFormSubmit = (set: boolean, close: boolean) => {
        this.setState({ isSubmititng: set });
        if (close) {
            this.handleRequestClose();
        }
    };

    render() {
        return (
            <ModalWrapper
                returnFocus={this.props.returnFocus}
                open={this.props.open}
                onRequestClose={this.handleRequestClose}
            >
                <Modal.Header
                    title={this.props.formLabel}
                    onRequestClose={this.handleRequestClose}
                />
                <Modal.Body>
                    <PageContext.Consumer>
                        {(pageContext) => (
                            <BaseFormView
                                ref={this.form}
                                page={this.props.page}
                                serviceName={this.props.serviceName}
                                mode={this.props.mode}
                                stanzaName={this.props.stanzaName || 'unknownStanza'}
                                handleFormSubmit={this.handleFormSubmit}
                                groupName={this.props.groupName}
                                pageContext={pageContext}
                            />
                        )}
                    </PageContext.Consumer>
                </Modal.Body>
                <Modal.Footer>
                    <UCCButton
                        appearance="secondary"
                        onClick={this.handleRequestClose}
                        label={_('Cancel')}
                        disabled={this.state.isSubmititng}
                    />
                    <UCCButton
                        className="saveBtn"
                        label={this.buttonText}
                        loading={this.state.isSubmititng}
                        onClick={this.handleSubmit}
                    />
                </Modal.Footer>
            </ModalWrapper>
        );
    }
}

export default EntityModal;
