import { css } from 'styled-components';
import { variables } from '@splunk/themes';
import splunkDataSansRegular from './assets/fonts/splunkdatasans-regular.woff';
import splunkDataSansMedium from './assets/fonts/splunkdatasans-medium.woff';
import splunkDataSansBold from './assets/fonts/splunkdatasans-bold.woff';
import splunkDataSansMonoRegular from './assets/fonts/splunkdatasansmono-regular.woff';

const fontDefinitions = css`
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansRegular}') format('woff');
        font-weight: normal;
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansMedium}') format('woff');
        font-weight: ${variables.fontWeightSemiBold};
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansBold}') format('woff');
        font-weight: bold;
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Mono';
        src: url('${splunkDataSansMonoRegular}') format('woff');
        font-weight: normal;
        font-style: normal;
    }
`;

export default fontDefinitions;
