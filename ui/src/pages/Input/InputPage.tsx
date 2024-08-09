import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import styled from 'styled-components';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import TabBar, { TabBarChangeHandler } from '@splunk/react-ui/TabBar';
import { _ } from '@splunk/ui-utils/i18n';
import { z } from 'zod';
import {
    InputsPage,
    TableFullServiceSchema,
    TableLessServiceSchema,
} from '../../types/globalConfig/pages';
import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { RowDataFields, TableContextProvider } from '../../context/TableContext';
import { MODE_CREATE, MODE_CLONE, MODE_EDIT, Mode } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
import { STYLE_PAGE } from '../../constants/dialogStyles';
import MenuInput, { ROOT_GROUP_NAME } from '../../components/MenuInput/MenuInput';
import TableWrapper from '../../components/table/TableWrapper';
import EntityModal from '../../components/EntityModal/EntityModal';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import EntityPage from '../../components/EntityPage/EntityPage';
import SubDescription from '../../components/SubDescription/SubDescription';
import useQuery from '../../hooks/useQuery';
import { regularInput, tableInput } from '../../constants/inputPageType';

const Row = styled(ColumnLayout.Row)`
    padding: 5px 0px;

    .title_menu_column {
        width: auto !important;
    }

    .page_subtitle {
        min-height: 20px;
    }

    .dropdown {
        text-align: right;
    }
`;

type ServiceTableSchema =
    | z.infer<typeof TableFullServiceSchema>
    | z.infer<typeof TableLessServiceSchema>;

interface EntityState {
    open: boolean;
    isInputPageStyle?: boolean;
    serviceName: string;
    mode: Mode;
    formLabel?: string;
    groupName?: string;
    stanzaName?: string;
}

function isTableFullServiceSchema(
    service: ServiceTableSchema | undefined
): service is z.infer<typeof TableFullServiceSchema> {
    return service !== undefined && 'description' in service;
}

function InputPage(): ReactElement {
    const [entity, setEntity] = useState<EntityState>({
        open: false,
        serviceName: '',
        mode: MODE_CREATE,
    });
    const unifiedConfigs = getUnifiedConfigs();
    const inputsPage = unifiedConfigs.pages.inputs as InputsPage;

    let services: ServiceTableSchema[] = [];
    let title;
    let table;
    let description;
    let subDescription;

    if (inputsPage.type === regularInput) {
        ({ services, title } = inputsPage);
    } else if (inputsPage.type === tableInput) {
        ({ services, title, table, description, subDescription } = inputsPage);
    }

    // check if the tabs feature is enabled or not.
    const isTabs = !table;

    const [activeTabId, setActiveTabId] = useState<string>(services[0].name);
    const selectedTab = services.find((x) => x.name === activeTabId);
    const isTableFullSchema = isTableFullServiceSchema(selectedTab);

    const PERMITTED_MODES = [MODE_CLONE, MODE_CREATE, MODE_EDIT];
    const permittedTabNames = services.map((service) => service.name);

    const navigate = useNavigate();
    const query = useQuery();

    useEffect(() => {
        setServiceEntity();
        setActiveTab();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useLocation().search]);

    const setServiceEntity = (): void => {
        const service = services.find((x) => x.name === query.get('service'));
        // Run only when service and action/mode is valid and modal/page is not open
        if (
            query &&
            service &&
            PERMITTED_MODES.includes(query.get('action') || '') &&
            !entity.open
        ) {
            // run when mode is not create and previous state info is available
            if (query.get('action') !== MODE_CREATE && entity.stanzaName) {
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service') || '',
                    mode: (query.get('action') as Mode) || '',
                });
            } else {
                // If previous state information is unavailable, create mode will be used by default
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service') || '',
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

    const setActiveTab = (): void => {
        if (query && permittedTabNames.includes(query.get('service') || '')) {
            setActiveTabId(query.get('service') || '');
        }
    };

    // handle modal/page open request on create/add entity button
    const handleRequestOpen = ({
        serviceName,
        groupName,
        input,
    }: {
        serviceName: string;
        groupName?: string;
        input?: string;
    }): void => {
        const service = services.find((x) => x.name === serviceName);
        const serviceTitle = service?.title;
        const isInputPageStyle = service?.style === STYLE_PAGE;

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
            const selectedGroup = groupName && groupName !== ROOT_GROUP_NAME ? groupName : null;
            const inputQueryValue = input || selectedGroup || serviceName;
            if (inputQueryValue) {
                query.set('input', inputQueryValue);
            } else {
                query.delete('input');
            }
            navigate({ search: query.toString() });
        }
    };

    // handle close/cancel/back request in add/create modal component
    const handleModalDialogClose = (): void => {
        setEntity({ ...entity, open: false });
    };

    // generate modal style dialog
    const generateModalDialog = (): ReactElement => (
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
    const handleOpenPageStyleDialog = (row: RowDataFields, mode: Mode): void => {
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
    const handlePageDialogClose = (): void => {
        setEntity({ ...entity, open: false });
        if (!isTabs) {
            query.delete('service');
        }
        query.delete('action');
        navigate({ search: query.toString() });
    };

    // generate page style dialog
    const generatePageDialog = () => (
        <EntityPage
            handleRequestClose={handlePageDialogClose}
            serviceName={entity.serviceName}
            stanzaName={entity.stanzaName}
            mode={entity.mode}
            formLabel={entity.formLabel}
            page={PAGE_INPUT}
            groupName={entity.groupName}
        />
    );

    const onTabChange = useCallback<TabBarChangeHandler>(
        (e, { selectedTabId }) => {
            if (selectedTabId) {
                setActiveTabId(selectedTabId);
                query.delete('action');
                query.set('service', selectedTabId);
                navigate({ search: query.toString() });
            }
        },
        [activeTabId] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
        <ErrorBoundary>
            <TableContextProvider>
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
                            <ColumnLayout.Column
                                className={isTabs ? 'title_menu_column' : ''}
                                span={9}
                            >
                                <TitleComponent>
                                    {isTabs ? _(selectedTab?.title || '') : _(title || '')}
                                </TitleComponent>
                                <SubTitleComponent className={isTabs ? 'pageSubtitle' : undefined}>
                                    {isTabs
                                        ? _(isTableFullSchema ? selectedTab?.description : '')
                                        : _(description || '')}
                                </SubTitleComponent>
                                <SubDescription
                                    text={subDescription?.text || ''}
                                    links={subDescription?.links}
                                />
                            </ColumnLayout.Column>
                            <ColumnLayout.Column
                                className={isTabs ? 'title_menu_column' : 'dropdown'}
                                span={3}
                            >
                                {!isTabs && <MenuInput handleRequestOpen={handleRequestOpen} />}
                            </ColumnLayout.Column>
                        </Row>
                    </ColumnLayout>
                    {isTabs ? (
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
                                            handleRequestOpen({ serviceName: service.name })
                                        }
                                        handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                                        displayActionBtnAllRows
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <TableWrapper
                            page={PAGE_INPUT}
                            handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                            displayActionBtnAllRows
                        />
                    )}

                    <ToastMessages position="top-right" />
                    {!entity.isInputPageStyle && entity.open ? generateModalDialog() : null}
                </div>
            </TableContextProvider>
        </ErrorBoundary>
    );
}

export default InputPage;
