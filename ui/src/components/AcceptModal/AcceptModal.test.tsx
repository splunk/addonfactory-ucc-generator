import { expect, it, vi } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@testing-library/react';
import AcceptModal from './AcceptModal';

const handleClose = vi.fn();

const renderModal = () =>
    render(
        <AcceptModal
            title="test Title"
            message="test message"
            open
            handleRequestClose={handleClose}
            returnFocus={() => {}}
            declineBtnLabel="No"
            acceptBtnLabel="Yes"
        />
    );

it('Return true on accept btn click', async () => {
    renderModal();

    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    const acceptButton = screen.getByText('Yes');
    expect(acceptButton).toBeInTheDocument();

    await userEvent.click(acceptButton);
    expect(handleClose).toHaveBeenCalledWith(true);
});

it('Return false on decline btn click', async () => {
    renderModal();

    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    const declineButton = screen.getByText('No');
    expect(declineButton).toBeInTheDocument();

    await userEvent.click(declineButton);
    expect(handleClose).toHaveBeenCalledWith(false);
});

it('Return false on closing modal by X btn', async () => {
    renderModal();

    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    const closeXBtn = screen.getByTestId('close');
    expect(closeXBtn).toBeInTheDocument();

    await userEvent.click(closeXBtn);
    expect(handleClose).toHaveBeenCalledWith(false);
});
