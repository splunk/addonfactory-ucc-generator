from selenium.common.exceptions import (
    ElementClickInterceptedException,
    StaleElementReferenceException,
)


def click_matching_option(component, key, value):
    normalized_value = value.strip().casefold()

    def _click_option(_browser):
        for option in component.browser.find_elements(*component.get_tuple(key)):
            try:
                if (
                    option.text.strip().casefold() == normalized_value
                    and option.is_displayed()
                    and option.is_enabled()
                ):
                    option.click()
                    return True
            except (
                ElementClickInterceptedException,
                StaleElementReferenceException,
            ):
                return False
        return False

    return component.wait.until(_click_option, f"{value} not found in select list")
