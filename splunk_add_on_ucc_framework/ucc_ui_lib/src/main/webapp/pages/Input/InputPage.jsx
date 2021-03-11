import React, { useState, useEffect } from 'react';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import TableWrapper from '../../components/table/TableWrapper';

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
            <TableWrapper
                isInput={isInput}
                serviceName={serviceName}
            />
        </>
    );
}

export default InputPage;
