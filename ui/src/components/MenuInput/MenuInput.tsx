import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Dropdown from '@splunk/react-ui/Dropdown';
import Menu from '@splunk/react-ui/Menu';
import SlidingPanels from '@splunk/react-ui/SlidingPanels';
import ChevronLeft from '@splunk/react-icons/ChevronLeft';
import { _ as i18n } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import { getFormattedMessage } from '../../util/messageUtil';
import { getUnifiedConfigs } from '../../util/util';
import CustomMenu from '../CustomMenu';
import { invariant } from '../../util/invariant';
import { usePageContext } from '../../context/usePageContext';
import { shouldHideForPlatform } from '../../util/pageContext';
import { UCCButton } from '../UCCButton/UCCButton';

const CustomSubTitle = styled.span`
    color: ${variables.brandColorD20};
    font-size: ${variables.fontSizeSmall};
    font-weight: 500;
`;

export const ROOT_GROUP_NAME = 'main_panel';

interface Group {
    name: string;
    hasSubmenu: boolean;
    title: string;
    subTitle?: string;
}

interface CustomMenuType {
    src: string;
    type: string;
}

interface MenuInputProps {
    handleRequestOpen: (args: { serviceName: string; input?: string; groupName?: string }) => void;
}

function MenuInput({ handleRequestOpen }: MenuInputProps) {
    const [activePanelId, setActivePanelId] = useState<string>(ROOT_GROUP_NAME);
    const [slidingPanelsTransition, setSlidingPanelsTransition] = useState<'forward' | 'backward'>(
        'forward'
    );
    const [openDropDown, setOpenDropDown] = useState(false);
    const [isSubMenu, setIsSubMenu] = useState(true);

    const { pages } = getUnifiedConfigs();
    const pageContext = usePageContext();

    const { inputs } = pages;
    invariant(inputs);
    const groupsMenu = 'groupsMenu' in inputs ? inputs.groupsMenu : undefined;
    const customMenuField = 'menu' in inputs ? inputs.menu : undefined;

    const [services, setServices] = useState(inputs.services);

    useEffect(() => {
        setServices(
            inputs.services.filter(
                (service) => !shouldHideForPlatform(service.hideForPlatform, pageContext.platform)
            )
        );
    }, [inputs.services, pageContext.platform]);

    const closeReasons = ['clickAway', 'escapeKey', 'offScreen', 'toggleClick'];
    const toggle = <UCCButton id="addInputBtn" label={i18n('Create New Input')} isMenu />;

    useEffect(() => {
        if (!isSubMenu) {
            setOpenDropDown(false);
            setIsSubMenu(true);
        }
    }, [isSubMenu]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRequestDropDownClose = ({ reason }: { reason: string }) => {
        setOpenDropDown(!closeReasons.includes(reason));
    };

    const handleRequestDropDownOpen = () => {
        setOpenDropDown(true);
    };

    const handleChangeCustomMenu = (val: { service: string; input: string }) => {
        const { service, input } = val;
        handleRequestOpen({ serviceName: service, input });
    };

    const getMenuItems = (serviceItems: Group[], groupName: string) =>
        serviceItems.map((service: Group) =>
            service?.hasSubmenu ? (
                <Menu.Item
                    hasSubmenu
                    key={service.name}
                    onClick={() => {
                        setActivePanelId(service.name);
                        setSlidingPanelsTransition('forward');
                    }}
                    placeholder={service.title}
                >
                    {service.title}
                </Menu.Item>
            ) : (
                <Menu.Item
                    key={service.name}
                    onClick={() => {
                        handleRequestOpen({ serviceName: service.name, groupName });
                        setIsSubMenu(false);
                    }}
                    placeholder={service.title}
                >
                    {service.title}
                    <CustomSubTitle>&nbsp;{service.subTitle}</CustomSubTitle>
                </Menu.Item>
            )
        );

    const getBackButton = () => (
        <>
            <Menu.Item
                startAdornment={<ChevronLeft />}
                onClick={() => {
                    setActivePanelId(ROOT_GROUP_NAME);
                    setSlidingPanelsTransition('backward');
                }}
                placeholder="Back"
            >
                Back
            </Menu.Item>
            <Menu.Divider />
        </>
    );

    const getSlidingsPanels = (servicesGroup: Record<string, Group[]>) =>
        Object.keys(servicesGroup).map((groupsName) => (
            <SlidingPanels.Panel key={groupsName} panelId={groupsName}>
                <Menu>
                    {groupsName !== ROOT_GROUP_NAME && getBackButton()}
                    {getMenuItems(servicesGroup[groupsName], groupsName)}
                </Menu>
            </SlidingPanels.Panel>
        ));

    const getInputMenu = useMemo(() => {
        const servicesGroup: Record<string, Group[]> = { [ROOT_GROUP_NAME]: [] };
        if (groupsMenu) {
            groupsMenu.forEach((group) => {
                if (group?.groupServices) {
                    servicesGroup[group.groupName] = [];
                    group.groupServices.forEach((serviceName: string) => {
                        const processedService = services.find(
                            (service) => service.name === serviceName
                        );
                        // service can be hidden by hideForPlatform and wont be in services array
                        if (processedService) {
                            servicesGroup[group.groupName].push({
                                name: serviceName,
                                hasSubmenu: false,
                                title: processedService?.title || '', // what should be done when title empty
                                subTitle: processedService?.subTitle,
                            });
                        }
                    });
                    // if there are services with hideForPlatform array can be empty
                    if (servicesGroup[group.groupName].length > 0) {
                        servicesGroup[ROOT_GROUP_NAME].push({
                            name: group.groupName,
                            title: group.groupTitle,
                            hasSubmenu: true,
                        });
                    }
                } else {
                    const serviceWithoutSubElements = services.find(
                        (service) => service.name === group.groupName
                    );
                    // service can be hidden by hideForPlatform and wont be in services array
                    if (serviceWithoutSubElements) {
                        servicesGroup[ROOT_GROUP_NAME].push({
                            name: group.groupName,
                            title: group.groupTitle,
                            subTitle: serviceWithoutSubElements?.subTitle,
                            hasSubmenu: false,
                        });
                    }
                }
            });
        } else {
            servicesGroup[ROOT_GROUP_NAME] = services.map((service) => ({
                name: service.name,
                title: service.title,
                subTitle: service.subTitle,
                hasSubmenu: false,
            }));
        }
        return getSlidingsPanels(servicesGroup);
    }, [services]); // eslint-disable-line react-hooks/exhaustive-deps

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
                style={{ width: '210px' }}
            >
                {getInputMenu}
            </SlidingPanels>
        </Dropdown>
    );

    // Making a dropdown if we have one service
    const makeInputButton = () => (
        <UCCButton
            label={getFormattedMessage(100)}
            id="addInputBtn"
            onClick={() => {
                handleRequestOpen({ serviceName: services[0].name });
            }}
        />
    );

    // Making a custom menu
    const makeCustomMenu = (menu: CustomMenuType) => (
        <>
            {React.createElement(CustomMenu, {
                fileName: menu.src,
                type: menu.type,
                handleChange: handleChangeCustomMenu,
            })}
        </>
    );

    const getCustomMenuAndGroupsMenu = (menu: CustomMenuType) => (
        <>
            {React.createElement(CustomMenu, {
                fileName: menu.src,
                type: menu.type,
                handleChange: handleChangeCustomMenu,
            })}
            {services.length === 1 ? makeInputButton() : makeSingleSelectDropDown()}
        </>
    );

    if (services && !customMenuField?.src) {
        return services.length === 1 ? makeInputButton() : makeSingleSelectDropDown();
    }

    // Introducing a condition to enable simultaneous support for custom menu src and Groups Menu.
    // ADDON-62948
    if (services && customMenuField?.src && groupsMenu) {
        return getCustomMenuAndGroupsMenu(customMenuField);
    }
    invariant(customMenuField);
    return makeCustomMenu(customMenuField);
}

MenuInput.propTypes = {
    handleRequestOpen: PropTypes.func,
};

export default MenuInput;
