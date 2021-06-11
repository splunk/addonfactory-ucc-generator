import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import styled from 'styled-components';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import { _ } from '@splunk/ui-utils/i18n';
import { getFormattedMessage } from '../../util/messageUtil';
import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { TableContextProvider } from '../../context/TableContext';
import { MODE_CREATE, MODE_CLONE, MODE_EDIT } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
import { STYLE_PAGE } from '../../constants/dialogStyles';
import CustomMenu from '../../components/CustomMenu';
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
    const { services, title, description, menu: customMenuField } = unifiedConfigs.pages.inputs;
    const toggle = (
        <Button appearance="primary" id="addInputBtn" label={_('Create New Input')} isMenu />
    );
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
                // if previous state info is not available then default to create mode
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history.location.search]);

    const changeRoute = (val) => {
        Object.keys(val).forEach((key) => {
            query.set(key, val[key]);
        });
        history.push({ search: query.toString() });
    };

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
                                <TitleComponent>{_(title)}</TitleComponent>
                                <SubTitleComponent>{_(description || '')}</SubTitleComponent>
                            </ColumnLayout.Column>
                            {services && services.length > 1 && !customMenuField?.src && (
                                <ColumnLayout.Column className="dropdown" span={3}>
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
                            {services && services.length === 1 && !customMenuField?.src && (
                                <ColumnLayout.Column span={3} className="input_button">
                                    <Button
                                        label={getFormattedMessage(100)}
                                        appearance="primary"
                                        id="addInputBtn"
                                        onClick={() => {
                                            handleRequestOpen(services[0].name, services[0].title);
                                        }}
                                    />
                                </ColumnLayout.Column>
                            )}
                            {customMenuField?.src && (
                                <ColumnLayout.Column span={3} className="input_button">
                                    {React.createElement(CustomMenu, {
                                        fileName: customMenuField.src,
                                        type: customMenuField.type,
                                        handleChange: changeRoute,
                                    })}
                                </ColumnLayout.Column>
                            )}
                        </Row>
                    </ColumnLayout>

                    <TableWrapper
                        page={PAGE_INPUT}
                        handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                    />
                    <ToastMessages position="top-right" />
                    {!entity.isInputPageStyle && entity.open ? generateModalDialog() : null}
                </div>
            </TableContextProvider>
        </ErrorBoundary>
    );
}

export default InputPage;
