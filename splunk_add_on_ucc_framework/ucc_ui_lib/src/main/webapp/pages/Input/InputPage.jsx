import React, { useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import styled from 'styled-components';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { TableContextProvider } from '../../context/TableContext';
import { MODE_CREATE } from '../../constants/modes';
import TableWrapper from '../../components/table/TableWrapper';
import EntityModal from '../../components/EntityModal';
import ErrorBoundary from '../../components/ErrorBoundary';
import '../style.scss';

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
    const [open, setOpen] = useState(false);
    const [serviceName, setServiceName] = useState(null);
    const [serviceLabel, setServiceLabel] = useState(null);
    const unifiedConfigs = getUnifiedConfigs();
    const { services, title, description } = unifiedConfigs.pages.inputs;
    const toggle = <Button appearance="primary" label={_('Create New Input')} isMenu />;

    const getInputMenu = () => {
        let arr = [];
        arr = services.map((service) => {
            return <Menu.Item key={service.name}>{service.title}</Menu.Item>;
        });
        return arr;
    };

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
                    page="inputs"
                    open={open}
                    handleRequestClose={handleRequestClose}
                    serviceName={serviceName}
                    mode={MODE_CREATE}
                    formLabel={serviceLabel}
                />
            );
        }
        return null;
    };

    return (
        <ErrorBoundary>
            <ColumnLayout gutter={8}>
                <Row>
                    <ColumnLayout.Column span={9}>
                        <TitleComponent>{_(title)}</TitleComponent>
                        <SubTitleComponent>{_(description)}</SubTitleComponent>
                    </ColumnLayout.Column>
                    {services && services.length > 1 && (
                        <ColumnLayout.Column className="dropdown" span={3}>
                            <Dropdown toggle={toggle}>
                                <Menu
                                    onClick={(event) => {
                                        const findname =
                                            services[
                                                services.findIndex(
                                                    (x) => x.title === event.target.innerText
                                                )
                                            ].name;
                                        setServiceLabel(`Add ${event.target.innerText}`);
                                        setServiceName(findname);
                                        handleRequestOpen();
                                    }}
                                >
                                    {getInputMenu()}
                                </Menu>
                            </Dropdown>
                        </ColumnLayout.Column>
                    )}
                    {services && services.length === 1 && (
                        <ColumnLayout.Column span={3} className="input_button">
                            <Button
                                label="Create New Input"
                                appearance="primary"
                                onClick={() => {
                                    setServiceName(services[0].name);
                                    setServiceLabel(`Add ${services[0].title}`);
                                    handleRequestOpen();
                                }}
                            />
                        </ColumnLayout.Column>
                    )}
                </Row>
            </ColumnLayout>
            <TableContextProvider value={null}>
                <TableWrapper page="inputs" />
                <ToastMessages />
                {generateModalDialog()}
            </TableContextProvider>
        </ErrorBoundary>
    );
}

export default InputPage;
