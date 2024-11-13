import pytest

from splunk_add_on_ucc_framework.tabs import ProxyTab


@pytest.fixture
def expected_generation():
    return {
        "name": "custom_proxy",
        "title": "Proxy",
        "entity": [
            {"type": "checkbox", "label": "Enable", "field": "proxy_enabled"},
            {
                "type": "text",
                "label": "Host",
                "validators": [
                    {
                        "type": "string",
                        "errorMsg": "Max host length is 4096",
                        "minLength": 0,
                        "maxLength": 4096,
                    },
                    {
                        "type": "regex",
                        "errorMsg": "Proxy Host should not have special characters",
                        "pattern": "^[a-zA-Z]\\w*$",
                    },
                ],
                "field": "proxy_url",
            },
            {
                "label": "Proxy port",
                "validators": [
                    {"type": "number", "range": [1025, 65535], "isInteger": True}
                ],
                "type": "text",
                "field": "proxy_port",
            },
            {
                "type": "text",
                "label": "Username",
                "validators": [
                    {
                        "type": "string",
                        "errorMsg": "Max length of username is 50",
                        "minLength": 0,
                        "maxLength": 50,
                    }
                ],
                "field": "proxy_username",
            },
            {
                "label": "Password for Proxy",
                "type": "text",
                "validators": [
                    {
                        "type": "string",
                        "errorMsg": "Max length of password is 8192",
                        "minLength": 0,
                        "maxLength": 8192,
                    }
                ],
                "encrypted": True,
                "field": "proxy_password",
            },
        ],
        "warning": {"config": {"message": "Some warning message"}},
    }


def test_proxy_tab(expected_generation):
    proxy_input = {
        "type": "proxyTab",
        "name": "custom_proxy",
        "port": {
            "label": "Proxy port",
            "validators": [
                {"type": "number", "range": [1025, 65535], "isInteger": True}
            ],
        },
        "username": True,
        "password": {"label": "Password for Proxy"},
        "warning": {"config": {"message": "Some warning message"}},
    }
    new_definition = ProxyTab.from_definition(proxy_input)
    assert new_definition == expected_generation


def test_proxy_short_tab_has_default_parameters():
    new_definition = ProxyTab.from_definition({"type": "proxyTab"})
    assert new_definition is not None
    assert new_definition["name"] == "proxy"
    assert new_definition["title"] == "Proxy"
    assert len(new_definition["entity"]) == 3


@pytest.mark.parametrize(
    "invalid_input, expected_failure_message",
    [
        (
            {
                "type": "proxyTab",
                "name": "custom_name",
                "password": {"label": "Password for Proxy"},
            },
            "Either of username or password is not mentioned.",
        ),
        (
            {
                "type": "proxyTab",
                "name": "custom_name",
                "password": {"label": "Password for Proxy"},
                "username": False,
            },
            "You had updated the password but set username to `false` which is not allowed "
            "set `username = True` for default configuration.",
        ),
        (
            {
                "type": "proxyTab",
                "name": "custom_name",
                "username": {"label": "Username for Proxy"},
                "password": False,
            },
            "You had updated the username but set the password to 'false' which is not allowed "
            "set `password = True` for default configuration.",
        ),
        (
            {
                "type": "proxyTab",
                "name": "custom_name",
                "username": True,
                "password": False,
            },
            "You had set conflicting values for username and password.",
        ),
    ],
)
def test_parametrize(caplog, invalid_input, expected_failure_message):
    with pytest.raises(SystemExit):
        ProxyTab.from_definition(invalid_input)
    assert expected_failure_message in caplog.text


def test_proxy_wrong_type():
    # only valid type is proxyTab
    assert ProxyTab.from_definition({"type": "otherTab"}) is None
