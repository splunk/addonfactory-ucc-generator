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
