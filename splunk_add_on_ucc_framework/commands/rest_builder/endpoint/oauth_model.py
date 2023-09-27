#
# Copyright 2023 Splunk Inc.
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
from typing import List

from splunk_add_on_ucc_framework import utils
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)


class OAuthModelEndpointBuilder(RestEndpointBuilder):
    def __init__(self, name: str, namespace: str, app_name: str) -> None:
        super().__init__(name, namespace)
        self._app_name = app_name

    def actions(self) -> List[str]:
        return ["edit"]

    def generate_rh(self) -> str:
        return (
            utils.get_j2_env()
            .get_template("oauth.template")
            .render(
                app_name=self._app_name,
            )
        )
