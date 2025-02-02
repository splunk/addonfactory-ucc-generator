import React, { useContext, useState } from 'react';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import update from 'immutability-helper';
import { _ } from '@splunk/ui-utils/i18n';

import { generateToast } from '../../util/util';
import { deleteRequest, generateEndPointUrl } from '../../util/api';
import TableContext from '../../context/TableContext';
import { getFormattedMessage, parseErrorMsg } from '../../util/messageUtil';
import { PAGE_INPUT } from '../../constants/pages';
import { StandardPages } from '../../types/components/shareableTypes';
import { UCCButton } from '../UCCButton/UCCButton';
import { isActionsContainsField } from '../table/CustomTableRow';
import { IActionSchema } from '../../types/globalConfig/pages';

export interface DeleteModalProps {
    page: StandardPages;
    handleRequestClose: () => void;
    serviceName: string;
    stanzaName: string;
    open?: boolean;
    actions: IActionSchema;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    page,
    handleRequestClose,
    serviceName,
    stanzaName,
    open = false,
    actions,
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

    const deleteMsg =
        page === PAGE_INPUT
            ? getFormattedMessage(103, [stanzaName])
            : getFormattedMessage(102, [stanzaName]);
    const deleteAction = isActionsContainsField(actions, 'delete');
    const title = deleteAction.isTitleExist ? deleteAction.titleValue : getFormattedMessage(101);

    return (
        <Modal open={open} style={{ width: '800px' }}>
            <Modal.Header title={title} onRequestClose={handleRequestCloseInternal} />
            <Modal.Body className="deletePrompt">
                {errorMsg && (
                    <div>
                        <Message appearance="fill" type="error">
                            {errorMsg}
                        </Message>
                    </div>
                )}
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
