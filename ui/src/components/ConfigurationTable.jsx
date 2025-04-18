import React, { useState, memo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { TableContextProvider } from '../context/TableContext';
import TableWrapper from './table/TableWrapper';
import EntityModal from './EntityModal/EntityModal';
import EntityPage from './EntityPage/EntityPage';
import { MODE_CREATE, MODE_CLONE } from '../constants/modes';
import { PAGE_CONF } from '../constants/pages';
import { STYLE_PAGE } from '../constants/dialogStyles';

function ConfigurationTable({ selectedTab, updateIsPageOpen }) {
    const [entity, setEntity] = useState({ open: false });

    const isConfigurationPageStyle = selectedTab.style === STYLE_PAGE;

    useEffect(() => {
        if (isConfigurationPageStyle) {
            updateIsPageOpen(!!entity.open);
        }
    }, [updateIsPageOpen, isConfigurationPageStyle, entity]);

    const handleRequestOpen = () => {
        setEntity({
            ...entity,
            open: true,
            mode: MODE_CREATE,
            formLabel: selectedTab.formTitle
                ? `Add ${selectedTab.formTitle}`
                : `Add ${selectedTab.title}`,
        });
    };

    // handle close request for modal style dialog
    const handleModalDialogClose = () => {
        setEntity({ ...entity, open: false });
    };

    // TODO: returnFocus ADDON-78884
    // generate modal style dialog
    const generateModalDialog = () => (
        <EntityModal
            page={PAGE_CONF}
            open={entity.open}
            handleRequestClose={handleModalDialogClose}
            returnFocus={() => {}}
            serviceName={selectedTab.name}
            mode={MODE_CREATE}
            formLabel={entity.formLabel}
        />
    );

    // handle clone/edit request per row from table for page style dialog
    const handleOpenPageStyleDialog = (row, mode) => {
        const formlabel = selectedTab?.formTitle || selectedTab.title;
        setEntity({
            ...entity,
            open: true,
            stanzaName: row.name,
            formLabel: mode === MODE_CLONE ? `Clone ${formlabel}` : `Update ${formlabel}`,
            mode,
        });
    };

    // handle close request for page style dialog
    const handlePageDialogClose = () => {
        setEntity({ ...entity, open: false });
    };

    // generate page style dialog
    const generatePageDialog = () => (
        <EntityPage
            open={entity.open}
            handleRequestClose={handlePageDialogClose}
            serviceName={selectedTab.name}
            stanzaName={entity.stanzaName}
            mode={entity.mode}
            formLabel={entity.formLabel}
            page={PAGE_CONF}
        />
    );

    const getTableWrapper = () => (
        <div
            style={
                isConfigurationPageStyle && entity.open ? { display: 'none' } : { display: 'block' }
            }
        >
            <TableWrapper
                page={PAGE_CONF}
                serviceName={selectedTab.name}
                handleRequestModalOpen={() => handleRequestOpen()}
                handleOpenPageStyleDialog={handleOpenPageStyleDialog}
            />
        </div>
    );

    return (
        <TableContextProvider value={null}>
            {isConfigurationPageStyle && entity.open && generatePageDialog()}
            {getTableWrapper()}
            {!isConfigurationPageStyle && entity.open && generateModalDialog()}
        </TableContextProvider>
    );
}

ConfigurationTable.propTypes = {
    selectedTab: PropTypes.object,
    updateIsPageOpen: PropTypes.func,
};

export default memo(ConfigurationTable);
