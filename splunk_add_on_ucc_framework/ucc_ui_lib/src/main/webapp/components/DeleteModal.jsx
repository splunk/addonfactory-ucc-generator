import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import update from 'immutability-helper';
import { _ } from '@splunk/ui-utils/i18n';

import { axiosCallWrapper } from '../util/axiosCallWrapper';
import TableContext from '../context/TableContext';
import { parseErrorMsg } from '../util/messageUtil';

const ModalWrapper = styled(Modal)`
    width: 800px
`;

class DeleteModal extends Component {
    static contextType=TableContext;

    constructor(props){
        super(props);
        this.state = {isDeleting:false,ErrorMsg:""};
    }
    
    handleRequestClose = () => {
        this.props.handleRequestClose();
    };

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
                const errorSubmitMsg= parseErrorMsg(err?.response?.data?.messages[0]?.text);
                this.setState({ErrorMsg:errorSubmitMsg,isDeleting:false});
                return Promise.reject(err);
            }).then(() => {
                this.context.setRowData( update(this.context.rowData,{[this.props.serviceName]: {$unset : [this.props.stanzaName] } }))
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
            deleteMsg = _(`Are you sure you want to delete "`) + this.props.stanzaName + _(`" ?`);
        }
        else{
            deleteMsg = _(`Are you sure you want to delete "`) + this.props.stanzaName + _(`" ? Ensure that no input is configured with "`) + this.props.stanzaName + _(`" as this will stop data collection for that input.`);
        }
        return (
            <ModalWrapper open={this.props.open}>
                    <Modal.Header
                        title={_("Delete Confirmation")}
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
                            label={_("Cancel")}
                            disabled={this.state.isDeleting}
                        />
                        <Button appearance="primary" 
                            label={this.state.isDeleting?<WaitSpinner/>: _("Delete")} 
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