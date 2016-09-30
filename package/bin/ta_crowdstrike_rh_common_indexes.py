"""
Get index list in SPlunk server.
"""

import ta_crowdstrike_import_declare

import json
import logging

from splunk import admin, rest
from splunktaucclib.rest_handler import util, error_ctl
from splunktalib.common import util as common_util

common_util.remove_http_proxy_env_vars()


class IndexHandler(admin.MConfigHandler):
    def setup(self):
        return

    def user_app(self):
        app = self.context != admin.CONTEXT_NONE and self.appName or "-"
        user = self.context == admin.CONTEXT_APP_AND_USER and \
            self.userName or "nobody"
        return user, app

    def handleList(self, confInfo):
        user, app = self.user_app()
        try:
            url = '{uri}/servicesNS/{user}/{app}/data/indexes' \
                  '?output_mode=json&search=isInternal=0+disabled=0&count=-1' \
                  ''.format(uri=rest.makeSplunkdUri(),
                            user=user, app=app)
            response, content = \
                rest.simpleRequest(url,
                                   sessionKey=self.getSessionKey(),
                                   method='GET',
                                   raiseAllErrors=True)
            res = json.loads(content)
            if 'entry' in res:
                ent = {'indexes': [entry['name'] for entry in res['entry']]}
                util.make_conf_item(confInfo['splunk_ta_ui_indexes'], ent)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1,
                                           msgx=exc,
                                           logLevel=logging.INFO)
        return


if __name__ == '__main__':
    admin.init(IndexHandler, admin.CONTEXT_APP_AND_USER)