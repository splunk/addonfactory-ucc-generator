import { render, screen } from '@testing-library/react';
import React, { createContext } from 'react';
import userEvent from '@testing-library/user-event';
import { AxiosResponse } from 'axios';
import * as axiosWrapper from '../../util/axiosCallWrapper';
import DeleteModal from './DeleteModal';
import { setUnifiedConfig } from '../../util/util';
import { UnifiedConfig } from './DeleteModal.stories';

jest.mock('immutability-helper', () => {
    return () => 1;
});

describe('Text Area Component', () => {
    const handleClose = jest.fn();

    const TableContext = createContext({
        rowData: { serviceName: { stanzaName: 1 } },
        setRowData: () => {},
    });

    beforeEach(() => {
        setUnifiedConfig(UnifiedConfig);

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

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should render delete modal correctly', () => {
        const deleteModal = screen.getByTestId('modal');
        expect(deleteModal).toBeInTheDocument();

        const buttons = screen.getAllByTestId('button');

        expect(buttons[0]).toHaveTextContent('Cancel');
        expect(buttons[1]).toHaveTextContent('Delete');
    });

    it('close model and callback after cancel click', async () => {
        const buttons = screen.getAllByTestId('button');
        await userEvent.click(buttons[0]);
        await new Promise((r) => setTimeout(r, 500)); // wait for animation to end
        expect(handleClose).toHaveBeenCalled();
    });

    it('correct delete request', async () => {
        jest.spyOn(axiosWrapper, 'axiosCallWrapper').mockImplementation(() => {
            return new Promise((r) => r('works correct' as unknown as PromiseLike<AxiosResponse>));
        });

        const buttons = screen.getAllByTestId('button');
        await userEvent.click(buttons[1]);

        expect(handleClose).toHaveBeenCalled();
    });
});
