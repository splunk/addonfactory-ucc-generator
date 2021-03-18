import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import BaseFormView from './BaseFormView';

class EntityModal extends Component {
    constructor(props) {
        super(props);
        this.form = React.createRef();
    }

    handleRequestClose = () => {
        this.props.handleRequestClose();
    };

    handleSubmit = () =>{
        const { result, data } = this.form.current.handleSubmit();
        if(result){
            const save = this.props.handleSavedata(data);
            if(save){
                this.handleRequestClose()
            }
            else{
                this.form.current.handleRemove();
            }
            
        }
    }

    render() {
        return (
            <div>
                <Modal
                    onRequestClose={this.handleRequestClose}
                    open={this.props.open}
                >
                    <Modal.Header title={this.props.formLabel} onRequestClose={this.handleRequestClose} />
                    <Modal.Body>
                        <BaseFormView 
                            ref={this.form }
                            isInput= { this.props.isInput }
                            serviceName={this.props.serviceName}
                            mode={this.props.mode}
                            currentInput={this.props.currentInput}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            appearance="secondary"
                            onClick={this.handleRequestClose}
                            label="Cancel"
                        />
                        <Button appearance="primary" label="Submit" onClick={this.handleSubmit}/>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

EntityModal.propTypes = {
    isInput: PropTypes.bool,
    open: PropTypes.bool,
    handleRequestClose:PropTypes.func,
    serviceName:PropTypes.string,
    mode:PropTypes.string,
    currentInput:PropTypes.object,
    formLabel:PropTypes.string,
    handleSavedata:PropTypes.func
}

export default EntityModal;