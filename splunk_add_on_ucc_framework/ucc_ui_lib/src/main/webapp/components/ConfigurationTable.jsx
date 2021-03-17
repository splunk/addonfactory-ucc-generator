import React, { useState } from 'react';
import Button from '@splunk/react-ui/Button';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import { InputRowContextProvider } from '../context/InputRowContext';
import TableWrapper from './table/TableWrapper';
import ErrorBoundary from './ErrorBoundary';
import EntityModal from './EntityModal';
import { MODE_CREATE } from '../constants/modes';

const ConfigurationTable = ({ serviceName, serviceTitle, handleSavedata }) => {
    const [open, setOpen] = useState(false);
    const serviceLabel = `Add ${serviceTitle}`;

    const handleRequestOpen = () => {
        setOpen(true);
    };

    const handleRequestClose = () => {
        setOpen(false);
    };
    const generateModalDialog = () => {
        if (open) {
            return (
                <EntityModal
                    isInput={false}
                    open={open}
                    handleRequestClose={handleRequestClose}
                    handleSavedata={handleSavedata}
                    serviceName={serviceName}
                    mode={MODE_CREATE}
                    formLabel={serviceLabel}
                />
            );
        }
        return null;
    };
    return (
        <>
            <InputRowContextProvider value={null}>
                <ErrorBoundary>
                    <TableWrapper
                        isInput={false}
                        serviceName={serviceName}
                        addButton={
                            <Button
                                label="Add"
                                appearance="primary"
                                onClick={() => handleRequestOpen()}
                            />
                        }
                    />
                </ErrorBoundary>
                <ToastMessages />
            </InputRowContextProvider>
            {generateModalDialog()}
        </>
    );
};

export default ConfigurationTable;
