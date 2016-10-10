import ProxyView from 'app/views/Configuration/Proxy';
import LoggingView from 'app/views/Configuration/Logging';
import AccountView from 'app/views/Configuration/Account';

export default {
    "configuration": {
        "header": {
            title: "Configuration",
            description: "Configure your Crowdstrike account, proxy and logging level.",
            enableButton: false,
            enableHr: false
        },
        "allTabs": [
            {
               title: "CrowdStrike Account",
               order: 0,
               active: true,
               view: AccountView
            },
            {
                title: "Proxy",
                order: 1,
                view: ProxyView
            },
            {
                title: "Logging",
                order: 2,
                view: LoggingView
            }
        ]
    }
};
