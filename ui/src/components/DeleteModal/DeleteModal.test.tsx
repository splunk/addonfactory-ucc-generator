import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { createContext } from 'react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import DeleteModal from './DeleteModal';
import { server } from '../../mocks/server';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';

const handleClose = vi.fn();
const handleReturnFocus = vi.fn();

const TableContext = createContext({
    rowData: { serviceName: { stanzaName: 1 } },
    setRowData: () => {},
});

const mockGlobalConfig = () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);
};

describe('Tests that require DeleteModal in beforeEach', () => {
    const setup = () =>
        render(
            <TableContext.Provider
                value={{ rowData: { serviceName: { stanzaName: 1 } }, setRowData: () => {} }}
            >
                <DeleteModal
                    handleRequestClose={handleClose}
                    returnFocus={handleReturnFocus}
                    serviceName="serviceName"
                    stanzaName="stanzaName"
                    page="inputs"
                    open
                />
            </TableContext.Provider>
        );

    it('should render delete modal correctly', () => {
        setup();
        const deleteModal = screen.getByTestId('modal');
        expect(deleteModal).toBeInTheDocument();
    });

    it('close modal and callback after cancel click', async () => {
        setup();
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancelButton);
        expect(handleClose).toHaveBeenCalled();
    });

    it('correct delete request', async () => {
        mockGlobalConfig();
        setup();
        server.use(
            http.delete(
                '/servicesNS/nobody/-/demo_addon_for_splunk_serviceName/stanzaName?output_mode=json',
                () => HttpResponse.json({}, { status: 201 })
            )
        );
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteButton);
        expect(handleClose).toHaveBeenCalled();
    });

    it('failed delete request', async () => {
        mockGlobalConfig();
        setup();
        const errorMessage = 'Oopsy doopsy';
        server.use(
            http.delete(
                '/servicesNS/nobody/-/demo_addon_for_splunk_serviceName/stanzaName?output_mode=json',
                () =>
                    HttpResponse.json(
                        {
                            messages: [
                                {
                                    text: `Unexpected error "<class 'splunktaucclib.rest_handler.error.RestError'>" from python handler: "REST Error [400]: Bad Request -- ${errorMessage}". See splunkd.log/python.log for more details.`,
                                },
                            ],
                        },
                        { status: 500 }
                    )
            )
        );
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteButton);
        expect(handleClose).not.toHaveBeenCalled();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
});

describe('Tests with a custom DeleteModal render', () => {
    it('should render the custom header correctly', async () => {
        render(
            <TableContext.Provider
                value={{ rowData: { serviceName: { stanzaName: 1 } }, setRowData: () => {} }}
            >
                <DeleteModal
                    handleRequestClose={handleClose}
                    returnFocus={handleReturnFocus}
                    serviceName="serviceName"
                    stanzaName="stanzaName"
                    page="inputs"
                    open
                    formTitle="this is custom header for delete"
                />
            </TableContext.Provider>
        );

        expect(
            screen.getByRole('heading', {
                name: 'Delete this is custom header for delete',
            })
        ).toBeInTheDocument();
    });

    it('should render the header correctly when title is empty', async () => {
        render(
            <TableContext.Provider
                value={{ rowData: { serviceName: { stanzaName: 1 } }, setRowData: () => {} }}
            >
                <DeleteModal
                    handleRequestClose={handleClose}
                    returnFocus={handleReturnFocus}
                    serviceName="serviceName"
                    stanzaName="stanzaName"
                    page="inputs"
                    open
                    formTitle=""
                />
            </TableContext.Provider>
        );
        expect(screen.getByRole('heading', { name: 'Delete Confirmation' })).toBeInTheDocument();
    });
});
