import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { InputRowData, InteractAllStatusButtons } from './InteractAllStatusButton';

describe('InteractAllStatusButtons', () => {
    const handleToggleStatusChange = vi.fn();

    let allDataRowsMockUp: InputRowData[];

    const renderStatusbutton = () => {
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
    };

    it('Deactivate All enabled rows correctly', async () => {
        renderStatusbutton();

        const user = userEvent.setup();
        const disableBtn = screen.getByText('Deactivate all');
        expect(disableBtn).toBeInTheDocument();

        await user.click(disableBtn);

        const yesPopUpBtn = screen.getByText('Yes');
        expect(yesPopUpBtn).toBeInTheDocument();

        await user.click(yesPopUpBtn);

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

    it('Activate All disabled rows correctly', async () => {
        renderStatusbutton();

        const user = userEvent.setup();
        const enableBtn = screen.getByText('Activate all');
        expect(enableBtn).toBeInTheDocument();

        await user.click(enableBtn);

        const yesPopUpBtn = screen.getByText('Yes');
        expect(yesPopUpBtn).toBeInTheDocument();

        await user.click(yesPopUpBtn);

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
        renderStatusbutton();

        const user = userEvent.setup();
        const disableBtn = screen.getByText('Deactivate all');
        expect(disableBtn).toBeInTheDocument();

        await user.click(disableBtn);

        const noPopUpBtn = screen.getByText('No');
        expect(noPopUpBtn).toBeInTheDocument();

        await user.click(noPopUpBtn);

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not enable status if rejected', async () => {
        renderStatusbutton();

        const user = userEvent.setup();
        const enableBtn = screen.getByText('Activate all');
        expect(enableBtn).toBeInTheDocument();

        await user.click(enableBtn);

        const noPopUpBtn = screen.getByText('No');
        expect(noPopUpBtn).toBeInTheDocument();

        await user.click(noPopUpBtn);

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not enable status if popup modal closed by X', async () => {
        renderStatusbutton();

        const user = userEvent.setup();
        const enableBtn = screen.getByText('Activate all');
        expect(enableBtn).toBeInTheDocument();

        await user.click(enableBtn);

        const closeXBtn = screen.getByTestId('close');
        expect(closeXBtn).toBeInTheDocument();

        await user.click(closeXBtn);

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });

    it('Do not disable status if popup modal closed by X', async () => {
        renderStatusbutton();

        const user = userEvent.setup();
        const disableBtn = screen.getByText('Deactivate all');
        expect(disableBtn).toBeInTheDocument();

        await user.click(disableBtn);

        const closeXBtn = screen.getByTestId('close');
        expect(closeXBtn).toBeInTheDocument();

        await user.click(closeXBtn);

        expect(handleToggleStatusChange).toHaveBeenCalledTimes(0);
    });
});
