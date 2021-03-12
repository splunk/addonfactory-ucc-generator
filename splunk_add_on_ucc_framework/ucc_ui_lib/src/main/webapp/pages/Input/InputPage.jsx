import React, { useState, useEffect } from 'react';
import { _ } from '@splunk/ui-utils/i18n';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import TableWrapper from '../../components/table/TableWrapper';
import ErrorBoundary from '../../components/ErrorBoundary';

function InputPage({ isInput, serviceName }) {
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);

    useEffect(() => {
        const unifiedConfigs = getUnifiedConfigs();
        setTitle(_(unifiedConfigs.pages.inputs.title));
        setDescription(_(unifiedConfigs.pages.inputs.description));
    }, []);

    return (
        <>
            <TitleComponent>{title}</TitleComponent>
            <SubTitleComponent>{description}</SubTitleComponent>
            <ErrorBoundary>
                <TableWrapper isInput={isInput} serviceName={serviceName} />
            </ErrorBoundary>
            <ToastMessages />
        </>
    );
}

export default InputPage;
