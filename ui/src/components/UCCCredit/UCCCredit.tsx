import React from 'react';
import { Typography } from '@splunk/react-ui/Typography';
import styled from 'styled-components';
import Link from '@splunk/react-ui/Link';
import { getUnifiedConfigs } from '../../util/util';

const StyledTypography = styled(Typography)`
    font-size: 0.8em;
`;

const UccCredit = () => {
    const unifiedConfigs = getUnifiedConfigs();

    if (unifiedConfigs?.meta?.hideUCCVersion) {
        return null;
    }
    // eslint-disable-next-line no-underscore-dangle
    const uccVersion = unifiedConfigs?.meta?._uccVersion ?? null;
    return (
        <StyledTypography
            as="span"
            title="Splunk Add-On UCC framework is a framework to generate UI-based Splunk add-ons. It includes UI, REST handlers, Modular inputs, OAuth and Alert action templates."
            data-test="ucc-credit"
        >
            Made with{' '}
            <Link to="https://splunk.github.io/addonfactory-ucc-generator/" openInNewContext>
                UCC
            </Link>{' '}
            {uccVersion}
        </StyledTypography>
    );
};

export default UccCredit;
