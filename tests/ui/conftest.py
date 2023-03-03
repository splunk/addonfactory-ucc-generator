import pytest


@pytest.fixture(scope="session")
def example_ta():
    """
    Fixture for example TA used for testing.
    """
    ta_name = "Splunk_TA_UCCExample"

    ta_info = {
        "name": "Splunk_TA_UCCExample",
        "proxy_url": f"servicesNS/nobody/{ta_name}/{ta_name}_settings/proxy",
        "default_log_level": "INFO",
    }

    return ta_info
