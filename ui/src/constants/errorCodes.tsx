import React from 'react';
import Link from '@splunk/react-ui/Link';

export default {
    ERR0001: (
        <>
            Input page failed to load, the server reported internal error, which may indicate:
            <ul>
                <li>You do not have access to this page</li>
                <li>There is a backend misconfiguration</li>
                <li>Missing configuration file</li>
            </ul>
            Those are only potential issues, for more information look into Details. <br />
            Check your installation or return to the{' '}
            <Link to="configuration">configuration page</Link>.
        </>
    ),
    ERR0002:
        'Configuration page failed to load, the server reported internal errors which may indicate you do not have access to this page.',
    ERR0003: 'Failed to load content due to no response from server!',
    ERR0004: 'Failed to load content due to failed request processing!',
    ERR0005: 'Failed to load current state for selected entity in form!',
};
