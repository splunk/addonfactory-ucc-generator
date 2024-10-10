import Modal from '@splunk/react-ui/Modal';
import React, { ReactElement, useEffect } from 'react';
import styled from 'styled-components';

import { variables } from '@splunk/themes';
import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import Checkmark from '@splunk/react-icons/Checkmark';
import { StyledButton } from '../EntryPageStyle';
import { makeVisualAdjustmentsOnDataIngestionModal } from './utils';

const ModalWrapper = styled(Modal)`
    width: 60vw;
    height: 80vh;
    margin-top: 3vh;
`;

const ModalHeader = styled(Modal.Header)`
    background-color: ${variables.neutral200};
`;

const ModalFooter = styled(Modal.Footer)`
    background-color: ${variables.neutral200};
`;

const ModalBody = styled(Modal.Body)`
    background-color: ${variables.neutral200};
    padding: 15px 30px;
    height: 70vh;
`;

const FooterButtonGroup = styled('div')`
    display: grid;
    grid-template-columns: 0.35fr 1fr;
    margin: 0px ${variables.spacingSmall};

    .footerBtn:first-child {
        justify-self: start;
    }

    .footerBtn:last-child {
        justify-self: end;
    }
`;

export const DataIngestionModal = ({
    open = false,
    handleRequestClose,
    title,
    acceptBtnLabel = 'Done',
    dataIngestionDropdownValues,
    selectValueForDropdownInModal,
    setSelectValueForDropdownInModal,
    children,
}: {
    open?: boolean;
    handleRequestClose: () => void;
    title?: string;
    acceptBtnLabel?: string;
    dataIngestionDropdownValues: Record<string, string>[];
    selectValueForDropdownInModal: string;
    setSelectValueForDropdownInModal: React.Dispatch<React.SetStateAction<string | null>>;
    children: ReactElement;
}) => {
    const toggle = (
        <Button label={selectValueForDropdownInModal} style={{ minWidth: '160px' }} isMenu />
    );
    const items: React.ReactElement[] = [];

    const filteredItemByValue = (findItem: string) =>
        dataIngestionDropdownValues.filter((item) => item.value === findItem)[0];
    const filteredItemByLabel = (findItem: string) =>
        dataIngestionDropdownValues.filter((item) => item.label === findItem)[0];

    // add selected value
    const selectedItem = filteredItemByValue(selectValueForDropdownInModal);
    items.push(
        <React.Fragment key={`selected-${selectedItem?.value}`}>
            <Menu.Item key={`selected-${selectedItem?.label}`} className="dropdown_menu_item">
                <Checkmark style={{ color: '#00A4FD', marginRight: '2px' }} />
                {selectedItem?.label}
            </Menu.Item>
            <Menu.Divider key="divider" />
        </React.Fragment>
    );

    // add list in dropdown except the selected value
    dataIngestionDropdownValues.forEach((item, index) => {
        if (selectValueForDropdownInModal !== item.value) {
            items.push(
                // eslint-disable-next-line react/no-array-index-key
                <Menu.Item key={`${item.label}-${index}`} className="dropdown_menu_item">
                    {item.label}
                </Menu.Item>
            );
        }
    });

    // handle onchange dropdown values
    function handleDropdownClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const selectedValue = (e.target as HTMLElement).textContent || '';
        const findSelectedValue = filteredItemByLabel(selectedValue);
        if (findSelectedValue) {
            setSelectValueForDropdownInModal(findSelectedValue.value);
        }
    }

    useEffect(() => {
        makeVisualAdjustmentsOnDataIngestionModal();
    }, [open]);

    return (
        <ModalWrapper open={open}>
            <ModalHeader
                onRequestClose={handleRequestClose}
                title={`Data ingestion details (By ${title})`}
            />
            <ModalBody>
                {children}
                <div id="data_ingestion_modal_dropdown" className="invisible_before_moving">
                    <p id="data_ingestion_dropdown_label">{title}</p>
                    <Dropdown toggle={toggle}>
                        <Menu
                            stopScrollPropagation
                            style={{
                                maxHeight: '40vh',
                                overflow: 'auto',
                                padding: '5px 0px',
                                margin: '10px 0px',
                            }}
                            onClick={(e) => handleDropdownClick(e)}
                        >
                            {items}
                        </Menu>
                    </Dropdown>
                </div>
            </ModalBody>
            <ModalFooter>
                <FooterButtonGroup>
                    <Button
                        id="open_search_on_visualization"
                        label="View ingested events in search"
                        openInNewContext
                        onClick={() => {
                            const searchButtonForNumberOfEvents = document.querySelector(
                                '#data_ingestion_modal_events_count_viz [data-test="open-search-button"]'
                            ) as HTMLElement | null;
                            const searchButtonForDataVolume = document.querySelector(
                                '#data_ingestion_modal_data_volume_viz [data-test="open-search-button"]'
                            ) as HTMLElement | null;

                            if (searchButtonForNumberOfEvents) {
                                searchButtonForNumberOfEvents.click();
                            } else {
                                searchButtonForDataVolume?.click();
                            }
                        }}
                    />
                    <StyledButton
                        id="done_button_footer"
                        className="footerBtn"
                        appearance="primary"
                        onClick={handleRequestClose}
                        label={acceptBtnLabel}
                    />
                </FooterButtonGroup>
            </ModalFooter>
        </ModalWrapper>
    );
};
