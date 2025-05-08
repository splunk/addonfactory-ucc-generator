import string
from textwrap import dedent

import pytest

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    SingleModelEndpointBuilder,
    SingleModelEntityBuilder,
    SingleModelEndpointBuilderWithOauth,
)


@pytest.mark.parametrize("need_reload", [True, False])
def test_multiple_model_endpoint_builder_need_reload(need_reload):
    endpoint = MultipleModelEndpointBuilder("test", "test", need_reload=need_reload)
    assert endpoint.generate_rh() == dedent(
        f"""
        import import_declare_test

        from splunktaucclib.rest_handler.endpoint import (
            field,
            validator,
            RestModel,
            MultipleModel,
        )
        from splunktaucclib.rest_handler import admin_external, util
        from None import None
        import logging

        util.remove_http_proxy_env_vars()



        endpoint = MultipleModel(
            'test_test',
            models=[

            ],
            need_reload={need_reload},
        )


        if __name__ == '__main__':
            logging.getLogger().addHandler(logging.NullHandler())
            admin_external.handle(
                endpoint,
                handler=None,
            )
        """
    )


@pytest.mark.parametrize("need_reload", [True, False])
def test_single_model_endpoint_builder_need_reload(need_reload):
    endpoint = SingleModelEndpointBuilder("test", "test", need_reload=need_reload)
    endpoint.add_entity(SingleModelEntityBuilder("test_entity", []))
    assert endpoint.generate_rh() == dedent(
        f"""
        import import_declare_test

        from splunktaucclib.rest_handler.endpoint import (
            field,
            validator,
            RestModel,
            SingleModel,
        )
        from splunktaucclib.rest_handler import admin_external, util
        from None import None
        import logging


        util.remove_http_proxy_env_vars()


        fields = [

        ]
        model = RestModel(fields, name='test_entity')


        endpoint = SingleModel(
            'test_test',
            model,
            config_name='test',
            need_reload={need_reload},
        )


        if __name__ == '__main__':
            logging.getLogger().addHandler(logging.NullHandler())
            admin_external.handle(
                endpoint,
                handler=None,
            )
        """
    )


@pytest.mark.parametrize("auth_condition", [True, False])
def test_single_model_with_oauth(auth_condition):
    endpoint = SingleModelEndpointBuilderWithOauth(
        "test",
        "test",
        "App",
        "/token",
        auth_condition,
        rest_handler_module="rest",
        rest_handler_class="Handler",
    )
    endpoint.add_entity(SingleModelEntityBuilder("test_entity", []))

    if auth_condition:
        auth_placeholder = 'self.callerArgs.data.get("auth_type", [""])[0]'
    else:
        auth_placeholder = '"oauth_client_credentials"'

    expected = dedent(
        """
        import import_declare_test

        from splunktaucclib.rest_handler.endpoint import (
            field,
            validator,
            RestModel,
            SingleModel,
        )
        from splunktaucclib.rest_handler import admin_external, util
        from rest import Handler
        import logging
        import json
        from solnlib import splunk_rest_client as rest_client
        from splunk.admin import InternalException


        util.remove_http_proxy_env_vars()


        fields = [

        ]
        model = RestModel(fields, name='test_entity')


        endpoint = SingleModel(
            'test_test',
            model,
            config_name='test',
            need_reload=False,
        )

        APP_NAME = 'App'
        OAUTH_ENDPOINT = 'test_oauth'
        TOKEN_ENDPOINT = '/token'


        class HandlerWithOauth(Handler):
            def __init__(self, *args, **kw):
                super().__init__(*args, **kw)
                self._oauth_url = f"/servicesNS/nobody/{APP_NAME}/{OAUTH_ENDPOINT}/oauth"
                self._rest_client = rest_client.SplunkRestClient(
                    self.getSessionKey(),
                    app=APP_NAME,
                )

            def oauth_call_url(self):
                host = (
                    self.callerArgs.data.get("endpoint_token_oauth_credentials", [None])[0]
                    or self.callerArgs.data.get("endpoint_token", [None])[0]
                    or self.callerArgs.data.get("endpoint", [None])[0]
                )

                return f"https://{host}/{TOKEN_ENDPOINT.lstrip('/')}"

            def oauth_client_credentials_call(self):
                auth_type = ${auth_placeholder}
                if auth_type != "oauth_client_credentials":
                    return

                client_id = (
                    self.callerArgs.data.get("client_id_oauth_credentials", [None])[0]
                    or self.callerArgs.data.get("client_id", [None])[0]
                )

                client_secret = (
                    self.callerArgs.data.get("client_secret_oauth_credentials", [None])[0]
                    or self.callerArgs.data.get("client_secret", [None])[0]
                )

                params = {
                    "grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "url": self.oauth_call_url(),
                    "method": "POST",
                }

                if "scope" in self.callerArgs.data:
                    params["scope"] = self.callerArgs.data.get("scope", [None])[0]

                data = json.loads(
                    self._rest_client.post(
                        self._oauth_url,
                        body=params,
                        headers=[("Content-Type", "application/json")],
                        output_mode="json",
                    ).body.read().decode("utf-8")
                )["entry"][0]["content"]

                if "access_token" not in data:
                    data = data.get("error", data)
                    raise InternalException("Error while trying to obtain OAuth token: %s" % data)

                self.payload["access_token"] = data["access_token"]

                for key in ["refresh_token", "instance_url"]:
                    if key in data:
                        self.payload[key] = data[key]

            def handleCreate(self, confInfo):
                self.oauth_client_credentials_call()
                return super().handleCreate(confInfo)


        if __name__ == '__main__':
            logging.getLogger().addHandler(logging.NullHandler())
            admin_external.handle(
                endpoint,
                handler=HandlerWithOauth,
            )
        """
    )

    expected = string.Template(expected).substitute(auth_placeholder=auth_placeholder)
    assert endpoint.generate_rh() == expected
