import { css } from 'styled-components';
import splunkDataSansRegular from './assets/fonts/splunkdatasans-regular.woff';
import splunkDataSansMedium from './assets/fonts/splunkdatasans-medium.woff';
import splunkDataSansBold from './assets/fonts/splunkdatasans-bold.woff';
import splunkDataSansMonoRegular from './assets/fonts/splunkdatasansmono-regular.woff';

const fontDefinitions = css`
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansRegular}') format('woff');
        font-weight: 400;
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansMedium}') format('woff');
        font-weight: 600;
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Sans';
        src: url('${splunkDataSansBold}') format('woff');
        font-weight: 700;
        font-style: normal;
    }
    @font-face {
        font-family: 'Splunk Platform Mono';
        src: url('${splunkDataSansMonoRegular}') format('woff');
        font-weight: 400;
        font-style: normal;
    }
`;

export default fontDefinitions;
