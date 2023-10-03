import React from 'react';

import { render, screen } from '@testing-library/react';
import { InputRowData, InteractAllStatusButtons } from './InteractAllStatusButton';

describe('InteractAllStatusButtons', () => {
    const handleToggleStatusChange = jest.fn();

    let allDataRowsMockUp: InputRowData[];

    beforeEach(() => {
        allDataRowsMockUp = [
            {
                account: 'Test_Account',
                disabled: false,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'aaaaa',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
            {
                account: 'Test_Account_2',
                disabled: false,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'bbbbb',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
            {
                account: 'aaaaa',
                disabled: false,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'brrrrrrr',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
            {
                account: 'Test_Account',
                disabled: true,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'cccccc',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
            {
                account: 'Test_Account_2',
                disabled: true,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'dddddd',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
            {
                account: 'aaaaa',
                disabled: true,
                host: '$decideOnStartup',
                host_resolved: 'testHost',
                index: 'default',
                interval: '300',
                name: 'gggggg',
                serviceName: 'demo_input',
                serviceTitle: 'demo_input',
                __toggleShowSpinner: false,
            },
        ];

        render(
            <InteractAllStatusButtons
                data-testid="actionBtns"
                displayActionBtnAllRows
                dataRows={allDataRowsMockUp}
                changeToggleStatus={handleToggleStatusChange}
            />
        );
    });

    it('Disable All enabled rows correctly', async () => {
        const disableBtn = await screen.findByText('Disable all');
        expect(disableBtn).toBeInTheDocument();

        disableBtn.click();

        const yesPopUpBtn = await screen.findByText('Yes');
        expect(yesPopUpBtn).toBeInTheDocument();

        yesPopUpBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'aaaaa')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'bbbbb')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'brrrrrrr')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledTimes(3);
    });

    it('Enable All disabled rows correctly', async () => {
        const enableBtn = await screen.findByText('Enable all');
        expect(enableBtn).toBeInTheDocument();

        enableBtn.click();

        const yesPopUpBtn = await screen.findByText('Yes');
        expect(yesPopUpBtn).toBeInTheDocument();

        yesPopUpBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'cccccc')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'dddddd')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledWith(
            allDataRowsMockUp.find((x) => x.name === 'gggggg')
        );
        expect(handleToggleStatusChange).toHaveBeenCalledTimes(3);
    });

    it('Do not disable status if rejected', async () => {
        const disableBtn = await screen.findByText('Disable all');
        expect(disableBtn).toBeInTheDocument();

        disableBtn.click();

        const noPopUpBtn = await screen.findByText('No');
        expect(noPopUpBtn).toBeInTheDocument();

        noPopUpBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not enable status if rejected', async () => {
        const enableBtn = await screen.findByText('Enable all');
        expect(enableBtn).toBeInTheDocument();

        enableBtn.click();

        const noPopUpBtn = await screen.findByText('No');
        expect(noPopUpBtn).toBeInTheDocument();

        noPopUpBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not enable status if popup modal closed by X', async () => {
        const enableBtn = await screen.findByText('Enable all');
        expect(enableBtn).toBeInTheDocument();

        enableBtn.click();

        const closeXBtn = screen.getByTestId('close');
        expect(closeXBtn).toBeInTheDocument();

        closeXBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not disable status if popup modal closed by X', async () => {
        const disableBtn = await screen.findByText('Disable all');
        expect(disableBtn).toBeInTheDocument();

        disableBtn.click();

        const closeXBtn = screen.getByTestId('close');
        expect(closeXBtn).toBeInTheDocument();

        closeXBtn.click();

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });
});
