import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import { _ } from '@splunk/ui-utils/i18n';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import useQuery from '../../hooks/useQuery';
import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { TableContextProvider } from '../../context/TableContext';
import TableWrapper from '../../components/table/TableWrapper';
import EntityModal from '../../components/EntityModal';
import { MODE_CREATE, MODE_CLONE, MODE_EDIT } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
import ErrorBoundary from '../../components/ErrorBoundary';
import EntityPage from '../../components/EntityPage';
import { STYLE_PAGE } from '../../constants/dialogStyles';

function InputPage() {
    const [entity, setEntity] = useState({ open: false });

    const unifiedConfigs = getUnifiedConfigs();
    const { services, title, description } = unifiedConfigs.pages.inputs;
    const toggle = <Button appearance="primary" label={_('Create New Input')} isMenu />;
    const PERMITTED_MODES = [MODE_CLONE, MODE_CREATE, MODE_EDIT];

    const history = useHistory();
    const query = useQuery();

    const getInputMenu = () => {
        let arr = [];
        arr = services.map((service) => {
            return <Menu.Item key={service.name}>{service.title}</Menu.Item>;
        });
        return arr;
    };

    // handle modal/page open request on create/add entity button
    const handleRequestOpen = (serviceName, serviceTitle) => {
        const isInputPageStyle = services.find((x) => x.name === serviceName).style === STYLE_PAGE;

        setEntity({
            ...entity,
            open: true,
            serviceName,
            mode: MODE_CREATE,
            formLabel: `Add ${serviceTitle}`,
            isInputPageStyle,
        });
        if (isInputPageStyle) {
            // set query and push to history
            query.set('service', serviceName);
            query.set('action', MODE_CREATE);
            history.push({ search: query.toString() });
        }
    };

    // handle close/cancel/back request in add/create modal component
    const handleModalDialogClose = () => {
        setEntity({ ...entity, open: false });
    };

    // generate modal style dialog
    const generateModalDialog = () => {
        return (
            <EntityModal
                page={PAGE_INPUT}
                open={entity.open}
                handleRequestClose={handleModalDialogClose}
                serviceName={entity.serviceName}
                mode={MODE_CREATE}
                formLabel={entity.formLabel}
            />
        );
    };

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
        history.push({ search: query.toString() });
    };

    // handle close request for page style dialog
    const handlePageDialogClose = () => {
        setEntity({ ...entity, open: false });
        query.delete('service');
        query.delete('action');
        history.push({ search: query.toString() });
    };

    // generate page style dialog
    const generatePageDialog = () => {
        return (
            <EntityPage
                open={entity.open}
                handleRequestClose={handlePageDialogClose}
                serviceName={entity.serviceName}
                stanzaName={entity.stanzaName}
                mode={entity.mode}
                formLabel={entity.formLabel}
            />
        );
    };

    useEffect(() => {
        const serviceTitle = entity.formLabel
            ? entity.formLabel
            : services.find((x) => x.name === query.get('service'))?.title;
        if (
            query &&
            serviceTitle &&
            PERMITTED_MODES.includes(query.get('action')) &&
            !entity.open
        ) {
            if (query.get('action') === MODE_CREATE) {
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service'),
                    mode: MODE_CREATE,
                    formLabel: `Create ${serviceTitle}`,
                });
            } else if (entity.stanzaName) {
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service'),
                    mode: query.get('action'),
                });
            } else {
                setEntity({
                    ...entity,
                    open: true,
                    isInputPageStyle: true,
                    serviceName: query.get('service'),
                    formLabel: `Create ${serviceTitle}`,
                    mode: MODE_CREATE,
                });
            }
        } else if (
            (!query.get('service') || !query.get('action')) &&
            entity.open &&
            entity.isInputPageStyle
        ) {
            setEntity({ ...entity, open: false });
        }
    }, [history.location.search]);

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
                        <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                            <ColumnLayout.Column span={9}>
                                <TitleComponent>{_(title)}</TitleComponent>
                                <SubTitleComponent>{_(description)}</SubTitleComponent>
                            </ColumnLayout.Column>
                            {services && services.length > 1 && (
                                <ColumnLayout.Column span={3} style={{ textAlign: 'right' }}>
                                    <Dropdown toggle={toggle}>
                                        <Menu
                                            onClick={(event) => {
                                                const findname =
                                                    services[
                                                        services.findIndex(
                                                            (x) =>
                                                                x.title === event.target.innerText
                                                        )
                                                    ].name;
                                                handleRequestOpen(findname, event.target.innerText);
                                            }}
                                        >
                                            {getInputMenu()}
                                        </Menu>
                                    </Dropdown>
                                </ColumnLayout.Column>
                            )}
                            {services && services.length === 1 && (
                                <Button
                                    label="Create New Input"
                                    appearance="primary"
                                    onClick={() => {
                                        handleRequestOpen(services[0].name, services[0].title);
                                    }}
                                />
                            )}
                        </ColumnLayout.Row>
                    </ColumnLayout>

                    <TableWrapper
                        page={PAGE_INPUT}
                        handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                    />
                    <ToastMessages />
                    {!entity.isInputPageStyle && entity.open ? generateModalDialog() : null}
                </div>
            </TableContextProvider>
        </ErrorBoundary>
    );
}

export default InputPage;
