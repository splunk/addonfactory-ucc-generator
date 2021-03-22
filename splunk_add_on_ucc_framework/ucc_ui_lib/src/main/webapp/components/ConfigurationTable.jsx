import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';

import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import { TableContextProvider } from '../context/TableContext';
import TableWrapper from './table/TableWrapper';
import EntityModal from './EntityModal';
import { MODE_CREATE } from '../constants/modes';

function ConfigurationTable({ serviceName, serviceTitle }) {
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
                    page="configuration"
                    open={open}
                    handleRequestClose={handleRequestClose}
                    handleSaveData={() => {}}
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
            <TableContextProvider value={null}>
                <TableWrapper
                    page="configuration"
                    serviceName={serviceName}
                    handleRequestModalOpen={() => handleRequestOpen()}
                />
                <ToastMessages />
                {generateModalDialog()}
            </TableContextProvider>
        </>
    );
}

ConfigurationTable.propTypes = {
    serviceName: PropTypes.string.isRequired,
    serviceTitle: PropTypes.string.isRequired,
};

export default memo(ConfigurationTable);
