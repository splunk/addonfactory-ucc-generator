from __future__ import absolute_import

from .base import RestEndpointBuilder
from jinja2 import Environment, FileSystemLoader
from os.path import dirname, abspath, join

# get to the root directory of the ta-ui-framework
top_dir = dirname(dirname(dirname(dirname(abspath(__file__)))))
j2_env = Environment(loader=FileSystemLoader(top_dir))

"""
This class is used to generate the endpoint for getting access token from auth code and 
extends RestEndpointBuilder class
"""
class OAuthModelEndpointBuilder(RestEndpointBuilder):

    """
    This is initialization of this endpoint builder class
    """
    def __init__(self, name, namespace, **kwargs):
        super(OAuthModelEndpointBuilder, self).__init__(name, namespace, **kwargs)
        self._app_name = kwargs.get('app_name')

    """
    Action will return the possible action for the endpoint
    """
    def actions(self):
        return ['list']

    """
    This will actually populate the jinja template with the token values and return it
    """
    def generate_rh(self, handler):
        return j2_env.get_template(
            join('templates', 'oauth.template')).render(
            app_name=self._app_name,
        )
