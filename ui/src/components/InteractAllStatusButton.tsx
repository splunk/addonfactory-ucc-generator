import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '@splunk/react-ui/Button';
import { variables } from '@splunk/themes';
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
            >
                Enable all
            </InteractAllActionButton>
            <InteractAllActionButton
                data-testid="disableAllBtn"
                onClick={() => {
                    setTryInteract(true);
                    setIsDisabling(true);
                }}
                role="button"
                disabled={props.dataRows.length < 1}
            >
                Disable all
            </InteractAllActionButton>
            {tryInteract && (
                <AcceptModal
                    message={`Do you want to ${
                        isDisabling ? 'disable' : 'enable'
                    } all? It may take a while.`}
                    open={tryInteract}
                    handleRequestClose={handleAcceptModal}
                    title={isDisabling ? 'Disable all' : 'Enable all'}
                    declineBtnLabel="No"
                    acceptBtnLabel="Yes"
                />
            )}
        </div>
    ) : null;
}
