import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';

import { TableContextProvider } from '../context/TableContext';
import TableWrapper from './table/TableWrapper';
import EntityModal from './EntityModal';
import { MODE_CREATE } from '../constants/modes';
import { PAGE_CONF } from '../constants/pages';

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
                    page={PAGE_CONF}
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
                    page={PAGE_CONF}
                    serviceName={serviceName}
                    handleRequestModalOpen={() => handleRequestOpen()}
                />
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
