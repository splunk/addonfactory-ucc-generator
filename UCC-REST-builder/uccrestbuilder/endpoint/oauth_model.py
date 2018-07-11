from __future__ import absolute_import

from .base import RestEntityBuilder, RestEndpointBuilder
from jinja2 import Environment, FileSystemLoader
from os.path import dirname, abspath, join

# get to the root directory of the ta-ui-framework
top_dir = dirname(dirname(dirname(dirname(abspath(__file__)))))
j2_env = Environment(loader=FileSystemLoader(top_dir))

class OAuthModelEndpointBuilder(RestEndpointBuilder):

    def __init__(self, name, namespace, **kwargs):
        super(OAuthModelEndpointBuilder, self).__init__(name, namespace, **kwargs)
        self._app_name = kwargs.get('app_name')

    def actions(self):
        return ['list']

    def generate_rh(self, handler):
        print(join('templates', 'oauth.template'))
        print(top_dir)
        return j2_env.get_template(
            join('templates', 'oauth.template')).render(
            app_name=self._app_name,
        )
