import importlib
import sys
from collections import defaultdict, namedtuple
from typing import Any
from unittest.mock import MagicMock

import httplib2
import pytest

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.oauth_model import (
    OAuthModelEndpointBuilder,
)


@pytest.fixture
def mocked_http(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr(httplib2, "Http", lambda *args, **kwargs: mock)

    Response = namedtuple("Response", ["status"])
    mock.request.return_value = (
        Response(200),
        '{"access_token": "test_token"}',
    )
    return mock


class SupportedArgs:
    def __init__(self):
        self.req_args = set()
        self.opt_args = set()

    def addReqArg(self, name):
        self.req_args.add(name)

    def addOptArg(self, name):
        self.opt_args.add(name)


ACTION_EDIT = 1


CallerArgs = namedtuple("CallerArgs", ["data"])


class MConfigHandler:
    def __init__(self, *args, **kwargs):
        self.requestedAction = ACTION_EDIT
        self.supportedArgs = SupportedArgs()
        self.callerArgs = CallerArgs({})

    def getSessionKey(self) -> str:
        return "session"

    def handleEdit(self, conf_info: dict[str, dict[str, Any]]) -> None:
        pass

    def setup(self) -> None:
        pass

    def call_with_params(self, params: dict[str, Any]) -> dict[str, dict[str, Any]]:
        self.callerArgs.data.clear()

        for key, value in params.items():
            if isinstance(value, list):
                self.callerArgs.data[key] = value
            else:
                self.callerArgs.data[key] = [value]

        conf_info: dict[str, dict[str, Any]] = defaultdict(dict)
        self.handleEdit(conf_info)

        return conf_info


@pytest.fixture(autouse=True)
def mock_splunk_modules(monkeypatch):
    # use monkeypatch to temporarily add nonexistent splunk module to sys.modules
    Admin = namedtuple("Admin", ["MConfigHandler", "ACTION_EDIT"])
    m_admin = Admin(MConfigHandler, ACTION_EDIT)
    monkeypatch.setitem(
        sys.modules,
        "splunk",
        namedtuple("splunk", "admin")(m_admin),
    )
    monkeypatch.setitem(
        sys.modules,
        "splunk.admin",
        m_admin,
    )
    monkeypatch.setitem(
        sys.modules,
        "import_declare_test",
        "",
    )

    monkeypatch.setitem(sys.modules, "splunk.rest", MagicMock(return_value=None))

    ConfManager = namedtuple(
        "ConfManager",
        ["InvalidHostnameError", "InvalidPortError", "get_log_level", "get_proxy_dict"],
    )
    m_c_manager = ConfManager(
        Exception,
        Exception,
        lambda *a, **k: "INFO",
        lambda *a, **k: {},
    )
    Solnlib = namedtuple("Solnlib", ["log", "conf_manager"])
    monkeypatch.setitem(
        sys.modules,
        "solnlib",
        Solnlib(
            MagicMock(name="log"),
            m_c_manager,
        ),
    )
    monkeypatch.setitem(
        sys.modules,
        "solnlib.conf_manager",
        m_c_manager,
    )
    monkeypatch.setitem(
        sys.modules,
        "solnlib.utils",
        namedtuple("utils", ["is_true"])(MagicMock(name="is_true")),
    )


def test_generated_oauth_endpoint(monkeypatch, tmp_path, mocked_http):
    builder = OAuthModelEndpointBuilder(
        name="account",
        namespace="Splunk_TA_NS",
        app_name="Splunk_TA_APP",
    )

    assert builder.actions() == ["edit"]

    file = tmp_path / "oauth_rh.py"
    file.write_text(builder.generate_rh())

    # prepend the path to the file to sys.path
    monkeypatch.setattr(sys, "path", [str(tmp_path)] + sys.path)

    imported = importlib.import_module("oauth_rh")
    cls = getattr(imported, "splunk_ta_app_rh_oauth2_token")

    handler: MConfigHandler = cls()
    handler.setup()

    assert handler.supportedArgs.req_args == {
        "client_id",
        "client_secret",
        "method",
        "grant_type",
        "url",
    }
    assert handler.supportedArgs.opt_args == {
        "code",
        "scope",
        "redirect_uri",
    }

    # authorization_code request but without "code"
    auth_params = {
        "grant_type": "authorization_code",
        "client_id": "test_client_id",
        "client_secret": "test_client_secret",
        "redirect_uri": "test_redirect_uri",
        "url": "http://test_url.localhost",
        "method": "POST",
    }

    with pytest.raises(ValueError) as ex:
        handler.call_with_params(auth_params)

    assert str(ex.value) == "code is required for authorization_code grant type"

    # authorization_code request with "code"
    auth_params["code"] = "test_code"
    conf_info = handler.call_with_params(auth_params)
    assert conf_info["token"] == {"access_token": "test_token"}
    assert mocked_http.request.call_args[0][0] == "http://test_url.localhost"
    assert mocked_http.request.call_args[1] == {
        "body": "grant_type=authorization_code"
        "&client_id=test_client_id"
        "&client_secret=test_client_secret"
        "&code=test_code"
        "&redirect_uri=test_redirect_uri",
        "headers": {"Content-Type": "application/x-www-form-urlencoded"},
        "method": "POST",
    }

    # client_credentials request
    for scope in (None, "test_scope"):
        params = {
            "grant_type": "client_credentials",
            "client_id": "test_client_id",
            "client_secret": "test_client_secret",
            "method": "POST",
            "url": "http://test_url.localhost",
        }

        if scope is not None:
            params["scope"] = scope

        conf_info = handler.call_with_params(params)
        assert conf_info["token"] == {"access_token": "test_token"}

        assert mocked_http.request.call_args[0][0] == "http://test_url.localhost"
        assert mocked_http.request.call_args[1] == {
            "body": "grant_type=client_credentials"
            "&client_id=test_client_id"
            "&client_secret=test_client_secret"
            f"{'&scope=' + scope if scope else ''}",
            "headers": {"Content-Type": "application/x-www-form-urlencoded"},
            "method": "POST",
        }

    # unknown grant_type
    with pytest.raises(ValueError) as ex:
        handler.call_with_params(
            {
                "grant_type": "unknown_grant_type",
                "client_id": "test_client_id",
                "client_secret": "test_client_secret",
                "method": "POST",
                "url": "http://test_url.localhost",
            }
        )

    assert (
        str(ex.value)
        == "Invalid grant_type unknown_grant_type. Supported values are authorization_code and client_credentials"
    )
