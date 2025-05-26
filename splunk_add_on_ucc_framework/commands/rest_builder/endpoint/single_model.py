#
# Copyright 2025 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from string import Template
from typing import List, Optional, TYPE_CHECKING, Any

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
    RestEntityBuilder,
)

if TYPE_CHECKING:
    from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.field import (
        RestFieldBuilder,
    )


class SingleModelEntityBuilder(RestEntityBuilder):
    def __init__(
        self, name: Optional[str], fields: List["RestFieldBuilder"], **kwargs: Any
    ) -> None:
        super().__init__(name, fields, **kwargs)

    @property
    def name_spec(self) -> str:
        return "<name>"

    @property
    def name_rh(self) -> str:
        return ""


class SingleModelEndpointBuilder(RestEndpointBuilder):
    _rh_template = """
import import_declare_test

from splunktaucclib.rest_handler.endpoint import (
    field,
    validator,
    RestModel,
    SingleModel,
)
from splunktaucclib.rest_handler import admin_external, util
from {handler_module} import {handler_class}
import logging
{additional_imports}

util.remove_http_proxy_env_vars()

{entity}

endpoint = SingleModel(
    '{conf_name}',
    model,
    config_name='{config_name}',
    need_reload={need_reload},
)
{additional_code}

if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin_external.handle(
        endpoint,
        handler={handler_class_used},
    )
"""

    def actions(self) -> List[str]:
        return ["edit", "list", "remove", "create"]

    def generate_rh(self) -> str:
        entity = self._entities[0]
        return self._rh_template.format(
            handler_module=self.rh_module,
            handler_class=self.rh_class,
            handler_class_used=self.rh_class,
            entity=entity.generate_rh(),
            conf_name=self.conf_name,
            config_name=self._name,
            need_reload=self.need_reload,
            additional_code="",
            additional_imports="",
        )


class SingleModelEndpointBuilderWithOauth(SingleModelEndpointBuilder):
    _imports = "".join(
        (
            "import json\n",
            "from solnlib import splunk_rest_client as rest_client\n",
            "from splunk.admin import InternalException\n",
        )
    )
    _cls_template = """
APP_NAME = ${app_name}
OAUTH_ENDPOINT = ${oauth_endpoint}
TOKEN_ENDPOINT = ${token_endpoint}


class ${class_name}(${base_class}):
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
        auth_type = ${auth_type}
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

    def handleEdit(self, confInfo):
        self.oauth_client_credentials_call()
        return super().handleEdit(confInfo)
"""

    def __init__(
        self,
        name: Optional[str],
        namespace: str,
        app_name: str,
        token_endpoint: str,
        auth_condition: bool,
        **kwargs: Any,
    ):
        super().__init__(name, namespace, **kwargs)
        self.token_endpoint = token_endpoint
        self.app_name = app_name
        self.auth_condition = auth_condition

    def generate_rh(self) -> str:
        entity = self._entities[0]

        oauth_endpoint = f"{self._namespace}_oauth"
        class_name = "HandlerWithOauth"

        if self.auth_condition:
            auth_type = 'self.callerArgs.data.get("auth_type", [""])[0]'
        else:
            auth_type = '"oauth_client_credentials"'

        cls_content = Template(self._cls_template).substitute(
            base_class=self.rh_class,
            oauth_endpoint=repr(oauth_endpoint),
            class_name=class_name,
            token_endpoint=repr(self.token_endpoint),
            app_name=repr(self.app_name),
            auth_type=auth_type,
        )

        return self._rh_template.format(
            handler_module=self.rh_module,
            handler_class=self.rh_class,
            handler_class_used=class_name,
            entity=entity.generate_rh(),
            conf_name=self.conf_name,
            config_name=self._name,
            need_reload=self.need_reload,
            additional_code=cls_content,
            additional_imports=self._imports,
        )
