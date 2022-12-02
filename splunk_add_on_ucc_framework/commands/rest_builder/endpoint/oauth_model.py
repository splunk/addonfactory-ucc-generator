#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from typing import List

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.base import (
    RestEndpointBuilder,
)

"""
This class is used to generate the endpoint for getting access token from
auth code and extends RestEndpointBuilder class
"""


class OAuthModelEndpointBuilder(RestEndpointBuilder):

    """
    This is initialization of this endpoint builder class
    """

    def __init__(self, name, j2_env, namespace, **kwargs):
        super().__init__(name, namespace, **kwargs)
        self._app_name = kwargs.get("app_name")
        self.j2_env = j2_env

    """
    Action will return the possible action for the endpoint
    """

    def actions(self) -> List[str]:
        return ["edit"]

    """
    This will actually populate the jinja template with the token values and return it
    """

    def generate_rh(self) -> str:
        return self.j2_env.get_template("oauth.template").render(
            app_name=self._app_name,
        )
