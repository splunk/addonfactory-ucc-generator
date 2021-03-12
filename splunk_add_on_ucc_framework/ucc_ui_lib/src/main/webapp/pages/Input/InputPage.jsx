import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';
import { TitleComponent, SubTitleComponent } from './InputPageStyle';
import TableWrapper from '../../components/table/TableWrapper';
import { InputRowContextProvider } from '../../context/InputRowContext';

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
            <InputRowContextProvider value={null}>
                <TableWrapper isInput={isInput} serviceName={serviceName} />
            </InputRowContextProvider>
        </>
    );
}

InputPage.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string.isRequired,
};

export default InputPage;
