from __future__ import absolute_import

from .base import RestEndpointBuilder


"""
This class is used to generate the endpoint for getting access token from auth code and 
extends RestEndpointBuilder class
"""


class OAuthModelEndpointBuilder(RestEndpointBuilder):

    """
    This is initialization of this endpoint builder class
    """

    def __init__(self, name, j2_env, namespace, **kwargs):
        super(OAuthModelEndpointBuilder, self).__init__(name, namespace, **kwargs)
        self._app_name = kwargs.get("app_name")
        self.j2_env = j2_env

    """
    Action will return the possible action for the endpoint
    """

    def actions(self):
        return ["edit"]

    """
    This will actually populate the jinja template with the token values and return it
    """

    def generate_rh(self, handler):
        return self.j2_env.get_template("oauth.template").render(
            app_name=self._app_name,
        )
