import React, { useState, useContext } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import update from 'immutability-helper';
import { _ } from '@splunk/ui-utils/i18n';

import { generateToast } from '../../util/util';
import { deleteRequest, generateEndPointUrl } from '../../util/api';
import TableContext from '../../context/TableContext';
import { parseErrorMsg, getFormattedMessage } from '../../util/messageUtil';
import { PAGE_INPUT } from '../../constants/pages';
import { StandardPages } from '../../types/components/shareableTypes';
import { UCCButton } from '../UCCButton/UCCButton';

export interface DeleteModalProps {
    page: StandardPages;
    handleRequestClose: () => void;
    serviceName: string;
    stanzaName: string;
    open?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    page,
    handleRequestClose,
    serviceName,
    stanzaName,
    open,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const context = useContext(TableContext);

    const handleRequestCloseInternal = () => {
        setErrorMsg(null);
        handleRequestClose();
    };

    const handleDelete = () => {
        setIsDeleting(true);
        setErrorMsg(null);

        deleteRequest({
            endpointUrl: generateEndPointUrl(
                `${encodeURIComponent(serviceName)}/${encodeURIComponent(stanzaName)}`
            ),
            handleError: false,
        })
            .then(() => {
                context?.setRowData(
                    update(context.rowData, {
                        [serviceName]: { $unset: [stanzaName] },
                    })
                );
                setIsDeleting(false);
                handleRequestCloseInternal();
                generateToast(`Deleted "${stanzaName}"`, 'success');
            })
            .catch((err) => {
                const errorSubmitMsg = parseErrorMsg(err);
                setErrorMsg(errorSubmitMsg);
                setIsDeleting(false);
            });
    };

    const generateErrorMessage = () => {
        if (errorMsg) {
            return (
                <div>
                    <Message appearance="fill" type="error">
                        {errorMsg}
                    </Message>
                </div>
            );
        }
        return null;
    };

    let deleteMsg;
    if (page === PAGE_INPUT) {
        deleteMsg = getFormattedMessage(103, [stanzaName]);
    } else {
        deleteMsg = getFormattedMessage(102, [stanzaName]);
    }

    return (
        <Modal open={open} style={{ width: '800px' }}>
            <Modal.Header
                title={getFormattedMessage(101)}
                onRequestClose={handleRequestCloseInternal}
            />
            <Modal.Body className="deletePrompt">
                {generateErrorMessage()}
                <p>{deleteMsg}</p>
            </Modal.Body>
            <Modal.Footer>
                <UCCButton
                    appearance="secondary"
                    onClick={handleRequestCloseInternal}
                    label={_('Cancel')}
                    disabled={isDeleting}
                />
                <UCCButton label={_('Delete')} onClick={handleDelete} loading={isDeleting} />
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteModal;
