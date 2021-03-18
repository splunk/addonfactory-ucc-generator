import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

import BaseFormView from './BaseFormView';

class EntityModal extends Component {
    constructor(props) {
        super(props);
        this.form = React.createRef();
        this.state = {isSubmititng:false};
    }

    handleRequestClose = () => {
        this.props.handleRequestClose();
    };

    handleSubmit = () => {
        const result  = this.form.current.handleSubmit();
        if (result){
            this.handleRequestClose();
        }
    };

    handleFormSubmit = (set,close) =>{
        this.setState({isSubmititng:set});
        if(close){
            this.handleRequestClose();
        }
    }

    render() {
        return (
            <div>
                <Modal onRequestClose={this.handleRequestClose} open={this.props.open}>
                    <Modal.Header
                        title={this.props.formLabel}
                        onRequestClose={this.handleRequestClose}
                    />
                    <Modal.Body>
                        <BaseFormView
                            ref={this.form}
                            isInput={this.props.isInput}
                            serviceName={this.props.serviceName}
                            mode={this.props.mode}
                            currentInput={this.props.currentInput}
                            handleFormSubmit={this.handleFormSubmit}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            appearance="secondary"
                            onClick={this.handleRequestClose}
                            label="Cancel"
                        />
                        <Button appearance="primary" 
                            label={this.state.isSubmititng?<WaitSpinner/>:"Submit"} 
                            onClick={this.handleSubmit}
                            disabled={this.state.isSubmititng}
                             />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

EntityModal.propTypes = {
    isInput: PropTypes.bool,
    open: PropTypes.bool,
    handleRequestClose: PropTypes.func,
    serviceName: PropTypes.string,
    mode: PropTypes.string,
    currentInput: PropTypes.object,
    formLabel: PropTypes.string
};

export default EntityModal;
