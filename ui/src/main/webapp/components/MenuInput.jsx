import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from '@splunk/react-ui/Button';
import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import SlidingPanels from '@splunk/react-ui/SlidingPanels';
import ChevronLeft from '@splunk/react-icons/ChevronLeft';
import { _ } from '@splunk/ui-utils/i18n';
import { getFormattedMessage } from '../util/messageUtil';
import { getUnifiedConfigs } from '../util/util';
import CustomMenu from './CustomMenu';

function MenuInput({ handleRequestOpen }) {
    const [activePanelId, setActivePanelId] = useState('main_panel');
    const [slidingPanelsTransition, setSlidingPanelsTransition] = useState('forward');
    const [openDropDown, setOpenDropDown] = useState(false);
    const [isSubMenu, setIsSubMenu] = useState(false);

    const unifiedConfigs = getUnifiedConfigs();
    const { services, menu: customMenuField, groupsMenu } = unifiedConfigs.pages.inputs;

    const closeReasons = ['clickAway', 'escapeKey', 'offScreen', 'toggleClick', 'contentClick'];
    const toggle = (
        <Button appearance="primary" id="addInputBtn" label={_('Create New Input')} isMenu />
    );

    useEffect(() => {
        if (isSubMenu) {
            setOpenDropDown(true);
            setIsSubMenu(false);
        }
    }, [openDropDown]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRequestDropDownClose = ({ reason }) => {
        setOpenDropDown(!closeReasons.includes(reason));
    };

    const handleRequestDropDownOpen = () => {
        setOpenDropDown(true);
    };

    const handleChangeCustomMenu = (val) => {
        const { service } = val;
        handleRequestOpen(service);
    };

    const getMenuItems = (serviceItems, groupName) =>
        serviceItems.map((service) =>
            service?.hasSubmenu ? (
                <Menu.Item
                    hasSubmenu
                    key={service.name}
                    onClick={() => {
                        setActivePanelId(service.name);
                        setSlidingPanelsTransition('forward');
                        setIsSubMenu(true);
                    }}
                >
                    {service.title}
                </Menu.Item>
            ) : (
                <Menu.Item
                    key={service.name}
                    onClick={() => {
                        handleRequestOpen(service.name, groupName);
                        setIsSubMenu(false);
                    }}
                >
                    {service.title}
                </Menu.Item>
            )
        );

    const getBackButton = () => (
        <>
            <Menu.Item
                icon={<ChevronLeft />}
                onClick={() => {
                    setActivePanelId('main_panel');
                    setSlidingPanelsTransition('backward');
                    setIsSubMenu(true);
                }}
            >
                Back
            </Menu.Item>
            <Menu.Divider />
        </>
    );

    const getSlidingsPanels = (servicesGroup) =>
        Object.keys(servicesGroup).map((groupsName) => (
            <SlidingPanels.Panel key={groupsName} panelId={groupsName}>
                <Menu>
                    {groupsName !== 'main_panel' && getBackButton()}
                    {getMenuItems(servicesGroup[groupsName], groupsName)}
                </Menu>
            </SlidingPanels.Panel>
        ));

    const getInputMenu = () => {
        const servicesGroup = { main_panel: [] };
        if (groupsMenu) {
            groupsMenu.forEach((group) => {
                if (group?.groupServices) {
                    servicesGroup[group.groupName] = [];
                    group.groupServices.forEach((serviceName) => {
                        servicesGroup[group.groupName].push({
                            name: serviceName,
                            title: services.find((service) => service.name === serviceName).title,
                            hasSubmenu: false,
                        });
                    });
                    servicesGroup.main_panel.push({
                        name: group.groupName,
                        title: group.groupTitle,
                        hasSubmenu: true,
                    });
                } else {
                    servicesGroup.main_panel.push({
                        name: group.groupName,
                        title: group.groupTitle,
                        hasSubmenu: false,
                    });
                }
            });
        } else {
            servicesGroup.main_panel = services.map((service) => ({
                name: service.name,
                title: service.title,
                hasSubmenu: false,
            }));
        }
        return getSlidingsPanels(servicesGroup);
    };

    // Making a dropdown if we have more than one service
    const makeSingleSelectDropDown = () => (
        <Dropdown
            toggle={toggle}
            open={openDropDown}
            onRequestClose={handleRequestDropDownClose}
            onRequestOpen={handleRequestDropDownOpen}
        >
            <SlidingPanels
                activePanelId={activePanelId}
                transition={slidingPanelsTransition}
                style={{ width: '200px' }}
            >
                {getInputMenu()}
            </SlidingPanels>
        </Dropdown>
    );

    // Making a dropdown if we have one service
    const makeInputButton = () => (
        <Button
            label={getFormattedMessage(100)}
            appearance="primary"
            id="addInputBtn"
            onClick={() => {
                handleRequestOpen(services[0].name);
            }}
        />
    );

    // Making a custom menu
    const makeCustomMenu = () => (
        <>
            {React.createElement(CustomMenu, {
                fileName: customMenuField.src,
                type: customMenuField.type,
                handleChange: handleChangeCustomMenu,
            })}
        </>
    );

    if (services && !customMenuField?.src) {
        return services.length === 1 ? makeInputButton() : makeSingleSelectDropDown();
    }
    return makeCustomMenu();
}

MenuInput.propTypes = {
    handleRequestOpen: PropTypes.func,
};

export default MenuInput;
