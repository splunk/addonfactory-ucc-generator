import { render, screen } from '@testing-library/react';
import React, { createContext } from 'react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import DeleteModal from './DeleteModal';
import { server } from '../../mocks/server';

jest.mock('immutability-helper');
jest.mock('../../util/util');

const handleClose = jest.fn();

const TableContext = createContext({
    rowData: { serviceName: { stanzaName: 1 } },
    setRowData: () => {},
});

beforeEach(() => {
    render(
        <TableContext.Provider
            value={{ rowData: { serviceName: { stanzaName: 1 } }, setRowData: () => {} }}
        >
            <DeleteModal
                handleRequestClose={handleClose}
                serviceName="serviceName"
                stanzaName="stanzaName"
                page="inputs"
                open
            />
        </TableContext.Provider>
    );
});

it('should render delete modal correctly', () => {
    const deleteModal = screen.getByTestId('modal');
    expect(deleteModal).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
});

it('close model and callback after cancel click', async () => {
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await userEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalled();
});

it('correct delete request', async () => {
    server.use(
        rest.delete('/servicesNS/nobody/-/mockGeneratedEndPointUrl', (req, res, ctx) =>
            res(ctx.status(201))
        )
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(handleClose).toHaveBeenCalled();
});

/*


{
    "links": {
        "create": "/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/_new"
    },
    "origin": "https://localhost:8000/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account",
    "updated": "2023-12-14T13:34:17+01:00",
    "generator": {
        "build": "64e843ea36b1",
        "version": "9.1.1"
    },
    "entry": [
        {
            "name": "aaaa",
            "id": "https://localhost:8000/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/aaaa",
            "updated": "1970-01-01T01:00:00+01:00",
            "links": {
                "alternate": "/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/aaaa",
                "list": "/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/aaaa",
                "edit": "/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/aaaa",
                "remove": "/servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account/aaaa"
            },
            "author": "admin",
            "acl": {
                "app": "Splunk_TA_UCCExample",
                "can_change_perms": true,
                "can_list": true,
                "can_share_app": true,
                "can_share_global": true,
                "can_share_user": true,
                "can_write": true,
                "modifiable": true,
                "owner": "admin",
                "perms": {
                    "read": [
                        "*"
                    ],
                    "write": [
                        "admin",
                        "sc_admin"
                    ]
                },
                "removable": true,
                "sharing": "global"
            },
            "content": {
                "account_checkbox": "1",
                "account_multiple_select": "one",
                "account_radio": "1",
                "auth_type": "basic",
                "basic_oauth_text": "aaa",
                "custom_endpoint": "login.example.com",
                "disabled": false,
                "eai:acl": null,
                "eai:appName": "Splunk_TA_UCCExample",
                "eai:userName": "nobody",
                "password": "******",
                "token": "******",
                "username": "aaa"
            }
        }
    ],
    "paging": {
        "total": 1,
        "perPage": 30,
        "offset": 0
    },
    "messages": []
}
*/
