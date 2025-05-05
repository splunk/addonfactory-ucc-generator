import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '@splunk/react-ui/Button';
import variables from '@splunk/themes/variables';
import AcceptModal from './AcceptModal/AcceptModal';

export interface InputRowData {
    account: string;
    disabled: boolean;
    host: string;
    // eslint-disable-next-line camelcase
    host_resolved: string;
    index: string;
    interval: string;
    name: string;
    serviceName: string;
    serviceTitle: string;
    __toggleShowSpinner: boolean;
}

interface DisableAllStatusButtonProps {
    displayActionBtnAllRows: boolean;
    dataRows: InputRowData[];
    changeToggleStatus: (row: InputRowData) => void;
}

const InteractAllActionButton = styled(Button)`
    max-width: fit-content;
    font-size: ${variables.fontSize};
`;

export function InteractAllStatusButtons(props: DisableAllStatusButtonProps) {
    const [tryInteract, setTryInteract] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);
    const activateButtonRef = useRef<HTMLButtonElement>(null);
    const deactivateButtonRef = useRef<HTMLButtonElement>(null);

    const handleInteractWithAllRowsStatus = (rowsData: InputRowData[]) => {
        rowsData.forEach((row) => {
            if (row.disabled !== isDisabling) {
                props.changeToggleStatus(row);
            }
        });
    };

    const handleAcceptModal = (e: boolean) => {
        setTryInteract(false);
        if (e) {
            handleInteractWithAllRowsStatus(props.dataRows);
        }
    };

    return props.displayActionBtnAllRows ? (
        <div>
            <InteractAllActionButton
                data-testid="enableAllBtn"
                onClick={() => {
                    setTryInteract(true);
                    setIsDisabling(false);
                }}
                role="button"
                disabled={props.dataRows.length < 1}
                elementRef={activateButtonRef}
            >
                Activate all
            </InteractAllActionButton>
            <InteractAllActionButton
                data-testid="disableAllBtn"
                onClick={() => {
                    setTryInteract(true);
                    setIsDisabling(true);
                }}
                role="button"
                disabled={props.dataRows.length < 1}
                elementRef={deactivateButtonRef}
            >
                Deactivate all
            </InteractAllActionButton>
            <AcceptModal
                message={`Do you want to ${
                    isDisabling ? 'deactivate' : 'activate'
                } all? It may take a while.`}
                open={tryInteract}
                handleRequestClose={handleAcceptModal}
                returnFocus={isDisabling ? deactivateButtonRef : activateButtonRef}
                title={isDisabling ? 'Deactivate all' : 'Activate all'}
                declineBtnLabel="No"
                acceptBtnLabel="Yes"
            />
        </div>
    ) : null;
}
