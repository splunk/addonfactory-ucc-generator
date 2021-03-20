import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import update from 'immutability-helper';

import { axiosCallWrapper } from '../util/axiosCallWrapper';
import InputRowContext from '../context/InputRowContext';

const ModalWrapper = styled(Modal)`
    width: 800px
`;

class DeleteModal extends Component {
    static contextType=InputRowContext;

    constructor(props){
        super(props);
        this.state = {isDeleting:false,ErrorMsg:""};
    }
    
    handleRequestClose = () => {
        this.props.handleRequestClose();
    };

    parseErrorMsg = (msg) => {
        let errorMsg = ''; let regex; let matches;
        try {
            regex = /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+([\s\S]*)"\.\s*See splunkd\.log(\/python.log)? for more details\./;
            matches = regex.exec(msg);
            if (matches && matches[1]) {
                try {
                    const innerMsgJSON = JSON.parse(matches[1]);
                    errorMsg = String(innerMsgJSON.messages[0].text);
                } catch (error) {
                    // eslint-disable-next-line prefer-destructuring
                    errorMsg = matches[1];
                }
            } else {
                errorMsg = msg;
            }
        } catch (err) {
            errorMsg = 'Error in processing the request';
        }
        return errorMsg;
    }

    handleDelete = () => {
        this.setState( (prevState)=> {
            return {...prevState, isDeleting:true,ErrorMsg:""}
        }, ()=>{

            axiosCallWrapper({
                serviceName: `${this.props.serviceName}/${this.props.stanzaName}`,
                customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'delete',
                handleError: false
            }).catch((err) => {
                const errorSubmitMsg= this.parseErrorMsg(err?.response?.data?.messages[0]?.text);
                this.setState({ErrorMsg:errorSubmitMsg,isDeleting:false});
                return Promise.reject(err);

            }).then((response) => {
                
                this.context.setRowData( update(this.context.rowData,{[this.props.serviceName]: {$unset : [this.props.stanzaName]}}))
                this.setState({isDeleting:false});
                this.handleRequestClose()
                
            });
        });

        
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
                )
            }
            return null; 
        }

    render() {
        let deleteMsg;
        if(this.props.isInput){
            deleteMsg = `Are you sure you want to delete "${this.props.stanzaName}" ?`;
        }
        else{
            deleteMsg = `Are you sure you want to delete "${this.props.stanzaName}" ? Ensure that no input is configured with "${this.props.stanzaName}" as this will stop data collection for that input.`;
        }
        return (
            <div>
                <ModalWrapper onRequestClose={this.handleRequestClose} open={this.props.open}>
                    <Modal.Header
                        title="Delete Confirmation"
                        onRequestClose={this.handleRequestClose}
                    />
                    <Modal.Body>
                        {this.generateErrorMessage()}
                        <p>{ deleteMsg }</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            appearance="secondary"
                            onClick={this.handleRequestClose}
                            label="Cancel"
                        />
                        <Button appearance="primary" 
                            label={this.state.isDeleting?<WaitSpinner/>:"Delete"} 
                            onClick={this.handleDelete}
                            disabled={this.state.isDeleting}
                             />
                    </Modal.Footer>
                </ModalWrapper>
            </div>
        );
    }
}

DeleteModal.propTypes = {
    isInput: PropTypes.bool,
    open: PropTypes.bool,
    handleRequestClose: PropTypes.func,
    serviceName: PropTypes.string,
    stanzaName: PropTypes.string
};

export default DeleteModal;
