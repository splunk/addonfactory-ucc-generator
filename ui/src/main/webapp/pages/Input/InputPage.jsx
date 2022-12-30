import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import styled from 'styled-components';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import TabBar from '@splunk/react-ui/TabBar';
import { _ } from '@splunk/ui-utils/i18n';
import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { TableContextProvider } from '../../context/TableContext';
import { MODE_CREATE, MODE_CLONE, MODE_EDIT } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
import { STYLE_PAGE } from '../../constants/dialogStyles';
import MenuInput from '../../components/MenuInput';
import TableWrapper from '../../components/table/TableWrapper';
import EntityModal from '../../components/EntityModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import EntityPage from '../../components/EntityPage';
import useQuery from '../../hooks/useQuery';

const Row = styled(ColumnLayout.Row)`
    padding: 5px 0px;

    .dropdown {
        text-align: right;
    }

    .input_button {
        text-align: right;
        margin-right: 0px;
    }
`;

function InputPage() {
    const [entity, setEntity] = useState({ open: false });
    const unifiedConfigs = getUnifiedConfigs();
    const { services, title, description } = unifiedConfigs.pages.inputs;

    // Used for outer table is present or not
    const table = unifiedConfigs.pages.inputs?.table;
    const isOuterTable = !!table;

    const [activeTabId, setActiveTabId] = useState(services[0].name);
    const [selectedTabDescription, setSelectedTabDescription] = useState(
        services[0]?.description || ''
    );
    const [selectedTabTitle, setSelectedTabTitle] = useState(services[0].title);

    const PERMITTED_MODES = [MODE_CLONE, MODE_CREATE, MODE_EDIT];
    const permittedTabNames = services.map((service) => service.name);

    const navigate = useNavigate();
    const query = useQuery();

    useEffect(() => {
        // eslint-disable-next-line no-use-before-define
        setServiceEntity();
        // eslint-disable-next-line no-use-before-define
        setActiveTab();
    }, [useLocation().search]); // eslint-disable-line react-hooks/exhaustive-deps

    const setServiceEntity = () => {
        const service = services.find((x) => x.name === query.get('service'));
        // Run only when service and action/mode is valid and modal/page is not open
        if (query && service && PERMITTED_MODES.includes(query.get('action')) && !entity.open) {
            // run when mode is not create and previous state info is available
            if (query.get('action') !== MODE_CREATE && entity.stanzaName) {
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service'),
                    mode: query.get('action'),
                });
            } else {
                // If previous state information is unavailable, create mode will be used by default
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service'),
                    formLabel: `Create ${service?.title}`,
                    mode: MODE_CREATE,
                });
            }
        } else if (
            (!query.get('service') || !query.get('action')) &&
            entity.open &&
            entity.isInputPageStyle
        ) {
            // Close page when any of the required query params are not provided
            setEntity({ ...entity, open: false });
        }
    };

    const setActiveTab = () => {
        if (query && permittedTabNames.includes(query.get('service'))) {
            setActiveTabId(query.get('service'));
        }
    };

    // handle modal/page open request on create/add entity button
    const handleRequestOpen = (serviceName, groupName) => {
        const service = services.find((x) => x.name === serviceName);
        const serviceTitle = service.title;
        const isInputPageStyle = service.style === STYLE_PAGE;

        setEntity({
            ...entity,
            open: true,
            serviceName,
            mode: MODE_CREATE,
            formLabel: `Add ${serviceTitle}`,
            isInputPageStyle,
            groupName,
        });
        if (isInputPageStyle) {
            // set query and push to navigate
            query.set('service', serviceName);
            query.set('action', MODE_CREATE);
            navigate({ search: query.toString() });
        }
    };

    // handle close/cancel/back request in add/create modal component
    const handleModalDialogClose = () => {
        setEntity({ ...entity, open: false });
    };

    // generate modal style dialog
    const generateModalDialog = () => (
        <EntityModal
            page={PAGE_INPUT}
            open={entity.open}
            handleRequestClose={handleModalDialogClose}
            serviceName={entity.serviceName}
            mode={MODE_CREATE}
            formLabel={entity.formLabel}
            groupName={entity.groupName}
        />
    );

    // handle clone/edit request per row from table for page style dialog
    const handleOpenPageStyleDialog = (row, mode) => {
        const label = services.find((x) => x.name === row.serviceName)?.title;
        setEntity({
            ...entity,
            open: true,
            isInputPageStyle: true,
            serviceName: row.serviceName,
            stanzaName: row.name,
            formLabel: mode === MODE_CLONE ? `Clone ${label}` : `Update ${label}`,
            mode,
        });
        // set query and push to history
        query.set('service', row.serviceName);
        query.set('action', mode);
        navigate({ search: query.toString() });
    };

    // handle close request for page style dialog
    const handlePageDialogClose = () => {
        setEntity({ ...entity, open: false });
        query.delete('action');
        navigate({ search: query.toString() });
    };

    // generate page style dialog
    const generatePageDialog = () => (
        <EntityPage
            open={entity.open}
            handleRequestClose={handlePageDialogClose}
            serviceName={entity.serviceName}
            stanzaName={entity.stanzaName}
            mode={entity.mode}
            formLabel={entity.formLabel}
            page={PAGE_INPUT}
            groupName={entity.groupName}
        />
    );

    const onTabChange = useCallback(
        (e, { selectedTabId }) => {
            setActiveTabId(selectedTabId);

            const selectedTabInfo = services.find((service) => service.name === selectedTabId);
            if (selectedTabInfo) {
                setSelectedTabDescription(selectedTabInfo.description);
                setSelectedTabTitle(selectedTabInfo.title);
            }

            query.delete('action');
            query.set('service', selectedTabId);
            navigate({ search: query.toString() });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [activeTabId] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
        <ErrorBoundary>
            <TableContextProvider value={null}>
                {entity.isInputPageStyle && entity.open ? generatePageDialog() : null}{' '}
                <div
                    style={
                        entity.isInputPageStyle && entity.open
                            ? { display: 'none' }
                            : { display: 'block' }
                    }
                >
                    <ColumnLayout gutter={8}>
                        <Row>
                            <ColumnLayout.Column span={9}>
                                <TitleComponent>
                                    {isOuterTable ? _(title || '') : _(selectedTabTitle)}
                                </TitleComponent>
                                <SubTitleComponent>
                                    {isOuterTable
                                        ? _(description || '')
                                        : _(selectedTabDescription || '')}
                                </SubTitleComponent>
                            </ColumnLayout.Column>
                            <ColumnLayout.Column className="dropdown" span={3}>
                                {isOuterTable && (
                                    <MenuInput handleRequestOpen={handleRequestOpen} />
                                )}
                            </ColumnLayout.Column>
                        </Row>
                    </ColumnLayout>
                    {isOuterTable ? (
                        <TableWrapper
                            page={PAGE_INPUT}
                            handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                        />
                    ) : (
                        <>
                            <TabBar activeTabId={activeTabId} onChange={onTabChange}>
                                {services.map((service) => (
                                    <TabBar.Tab
                                        key={service.name}
                                        label={_(service.title)}
                                        tabId={service.name}
                                    />
                                ))}
                            </TabBar>
                            {services.map((service) => (
                                <div
                                    key={service.name}
                                    style={
                                        service.name !== activeTabId
                                            ? { display: 'none' }
                                            : { display: 'block' }
                                    }
                                    id={`${service.name}Tab`}
                                >
                                    <TableWrapper
                                        page={PAGE_INPUT}
                                        serviceName={service.name}
                                        handleRequestModalOpen={() =>
                                            handleRequestOpen(service.name)
                                        }
                                        handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                                    />
                                </div>
                            ))}
                        </>
                    )}

                    <ToastMessages position="top-right" />
                    {!entity.isInputPageStyle && entity.open ? generateModalDialog() : null}
                </div>
            </TableContextProvider>
        </ErrorBoundary>
    );
}

export default InputPage;
