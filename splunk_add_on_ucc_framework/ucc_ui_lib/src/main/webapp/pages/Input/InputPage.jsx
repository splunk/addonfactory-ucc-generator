import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '@splunk/react-ui/Select';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import { _ } from '@splunk/ui-utils/i18n';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import { InputRowContextProvider } from '../../context/InputRowContext';
import TableWrapper from '../../components/table/TableWrapper';
import ErrorBoundary from '../../components/ErrorBoundary';

function InputPage({ isInput, serviceName }) {
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);

    const unifiedConfigs = getUnifiedConfigs();
    const { services } = unifiedConfigs.pages.inputs;

    useEffect(() => {
        setTitle(_(unifiedConfigs.pages.inputs.title));
        setDescription(_(unifiedConfigs.pages.inputs.description));
    }, []);

    const getSearchTypeDropdown = () => {
        let arr = [];
        arr = services.map((service) => {
            return <Select.Option key={service.name} label={service.title} value={service.name} />;
        });
        arr.unshift(
            <Select.Option
                key="createNew"
                value=""
                selected
                disabled
                hidden
                label="Create New Input"
            />
        );
        return arr;
    };

    return (
        <>
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                    <ColumnLayout.Column span={9}>
                        <TitleComponent>{_(title)}</TitleComponent>
                        <SubTitleComponent>{_(description)}</SubTitleComponent>
                    </ColumnLayout.Column>
                    {services && services.length > 1 && (
                        <ColumnLayout.Column span={3} style={{ textAlign: 'right' }}>
                            <Select
                                onChange={(e, { value }) => {
                                    console.log('On create new', value);
                                }}
                            >
                                {getSearchTypeDropdown()}
                            </Select>
                        </ColumnLayout.Column>
                    )}
                    {services && services.length === 1 && (
                        <Button
                            label="Create New Input"
                            appearance="flat"
                            onClick={() => {
                                console.log('On create new', services[0].name);
                            }}
                        />
                    )}
                </ColumnLayout.Row>
            </ColumnLayout>
            <InputRowContextProvider value={null}>
                <ErrorBoundary>
                    <TableWrapper isInput={isInput} serviceName={serviceName} />
                </ErrorBoundary>
                <ToastMessages />
            </InputRowContextProvider>
        </>
    );
}

InputPage.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string.isRequired,
};

export default InputPage;
