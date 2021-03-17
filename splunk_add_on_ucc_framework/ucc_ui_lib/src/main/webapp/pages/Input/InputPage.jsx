import React, { useState, useEffect } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import { _ } from '@splunk/ui-utils/i18n';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { InputRowContextProvider } from '../../context/InputRowContext';
import TableWrapper from '../../components/table/TableWrapper';
import EntityModal from '../../components/EntityModal'
import { MODE_CREATE } from "../../constants/modes";
import ErrorBoundary from '../../components/ErrorBoundary';


function InputPage() {
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);
    const [open, setOpen] = useState(false);
    const [serviceName, setserviceName] = useState(null);
    const [serviceLabel, setserviceLabel] = useState(null);
    const unifiedConfigs = getUnifiedConfigs();
    const { services } = unifiedConfigs.pages.inputs;
    const toggle = <Button appearance="toggle" label="Create New Input" isMenu />;

    useEffect(() => {
        setTitle(unifiedConfigs.pages.inputs.title);
        setDescription(unifiedConfigs.pages.inputs.description);
    }, []);

    const getInputMenu = () => {
        let arr = [];
        arr = services.map((service) => {
            return (<Menu.Item key={service.name}>{service.title}</Menu.Item>);
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
                < EntityModal
                    isInput
                    open={open}
                    handleRequestClose={handleRequestClose}
                    handleSavedata={null}
                    serviceName={serviceName}
                    mode={MODE_CREATE}
                    formLabel={serviceLabel}
                />
            );
        }
            return null;
    }

    return (
        <>
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                    <ColumnLayout.Column span={9}>
                        <TitleComponent>{title}</TitleComponent>
                        <SubTitleComponent>{description}</SubTitleComponent>
                    </ColumnLayout.Column>
                    {services && services.length > 1 &&
                        (<ColumnLayout.Column span={3} style={{ 'textAlign': 'right' }}>
                            <Dropdown toggle={toggle}>
                                <Menu onClick={ (event) => {
                                        const findname =  services[services.findIndex(x => x.title ===event.target.innerText)].name;
                                        setserviceLabel(`Add ${event.target.innerText}`)
                                        setserviceName(findname);
                                        handleRequestOpen();
                                        }
                                } >
                                    {getInputMenu()}
                                </Menu>
                            </Dropdown>

                        </ColumnLayout.Column>
                    )}
                    {services && services.length === 1 && (
                        <Button
                            label="Create New Input"
                            appearance="flat"
                            onClick={() => {
                                setserviceName(services[0].name)
                                setserviceLabel(`Add ${services[0].title}`)
                                handleRequestOpen();
                            }}
                        />
                    )}
                </ColumnLayout.Row>
            </ColumnLayout>
            <InputRowContextProvider value={null}>
                <ErrorBoundary>
                    <TableWrapper isInput serviceName={serviceName} />
                </ErrorBoundary>
                <ToastMessages />
            </InputRowContextProvider>
            {generateModalDialog()}
        </>
    );
}

export default InputPage;
