import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '@splunk/react-ui/Button';
import { variables } from '@splunk/themes';
import AcceptModal from './AcceptModal';

interface InputRowData {
    account: string;
    disabled: boolean;
    host: string;
    host_resolved: string;
    index: string;
    interval: string;
    name: string;
    serviceName: string;
    serviceTitle: string;
    __toggleShowSpinner: boolean;
}

export interface AllInputRowsData {
    [serviceName: string]: {
        [inputName: string]: InputRowData;
    };
}

interface DisableAllStatusButtonProps {
    displayActionBtnAllRows: boolean;
    totalElement: number;
    allDataRows: AllInputRowsData;
    changeToggleStatus: (row: InputRowData) => void;
}

const InteractAllActionButton = styled(Button)`
    max-width: fit-content;
    font-size: ${variables.fontSize};
`;

export function InteractAllStatusButtons(props: DisableAllStatusButtonProps) {
    const [tryInteract, setTryInteract] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);

    const handleInteractWithAllRowsStatus = (rowsData: AllInputRowsData) => {
        Object.values(rowsData).forEach((data) =>
            Object.values(data).forEach((row) => {
                if (row.disabled !== isDisabling) {
                    props.changeToggleStatus(row);
                }
            })
        );
    };

    const handleAcceptModal = (e: boolean) => {
        setTryInteract(false);
        if (e) {
            handleInteractWithAllRowsStatus(props.allDataRows);
        }
    };

    return props.displayActionBtnAllRows && props.totalElement > 1 ? (
        <div>
            <InteractAllActionButton
                data-testid="enableAllBtn"
                onClick={() => {
                    setTryInteract(true);
                    setIsDisabling(false);
                }}
                role="button"
                disabled={false}
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
                disabled={false}
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
