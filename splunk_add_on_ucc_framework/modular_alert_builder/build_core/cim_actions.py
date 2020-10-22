# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

from builtins import object
import json
import logging
import logging.handlers
import re
import splunk.rest as rest
from splunk.util import normalizeBoolean

class InvalidResultID(Exception):
    pass

class ModularAction(object):
    DEFAULT_MESSAGE = 'sendmodaction - signature="%s" action_name="%s" search_name="%s" sid="%s" orig_sid="%s" rid="%s" orig_rid="%s" app="%s" user="%s" action_mode="%s" action_status="%s"'

    ## we require a logging instance
    '''
2015-03-07T01:41:42.430696 got arguments ['/opt/splunk/etc/apps/logger_app/bin/logger.py', '--execute']
2015-03-07T01:41:42.430718 got payload: <?xml version="1.0" encoding="UTF-8"?>
<alert>
  <app> logger_app </app>
  <owner>admin</owner>
  <results_file>/opt/splunk/var/run/splunk/dispatch/rt_scheduler__admin__ logger_app__RMD5910195c23186c103_at_1425692383_0.0/results.csv.gz</results_file>
  <results_link>http://myserver:8000/app/logger_app/@go?sid=rt_scheduler__admin__ logger_app__RMD5910195c23186c103_at_1425692383_0.0</results_link>
  <server_host>myserver</server_host>
  <server_uri>https://127.0.0.1:8089</server_uri>
  <session_key>OCmOZHf37O^9fDktTrvNc6Kidz^68zs0Y7scufwRo6Lpdi5ZGmtxsPbIUlUKtjt9ZPG7gKz4Dq8_eVntQ5EGR^N9rqkmg1dREAp8FFCduDwwvl6pEXEB^4w3MS6suwp9acw7JOlb</session_key>
  <sid>rt_scheduler__admin__ logger_app__RMD5910195c23186c103_at_1425692383_0.0</sid>
  <search_name>my_saved_search</search_name>
  <configuration>
     <stanza name= my_saved_search"/>
  </configuration>
</alert>

json format
{
u'results_file': u'/Users/zhanghong/splunk_env/splunk_env_6.3.3/splunk/var/run/splunk/dispatch/scheduler__admin__search__RMD5f2f82c6b0b712cbb_at_1469423700_4185/per_result_alert/tmp_1.csv.gz',
u'server_host': u'hozhang-mbpo.sv.splunk.com',
u'sid': u'scheduler__admin__search__RMD5f2f82c6b0b712cbb_at_1469423700_4185',
u'result': {u'_bkt': u'main~899~DC01C3FC-2111-4BA8-BA2E-B6F07C5C9C30', u'gid': u'00g17z5bhl0Dpv2FF1d8', u'splunk_server': u'hozhang-mbpo.sv.splunk.com', u'_time': u'1467171788', u'_raw': u'demo_case=101 uid=00u17z584iaBW2Biz1d8 gid=00g17z5bhl0Dpv2FF1d8', u'demo_case': u'101', u'uid': u'00u17z584iaBW2Biz1d8', u'_serial': u'1', u'tag::eventtype': u'', u'_si': [u'hozhang-mbpo.sv.splunk.com', u'main'], u'index': u'main', u'sourcetype': u'okta_demo', u'uname': u'', u'eventtype': u'', u'_kv': u'1', u'host': u'hozhang-mbpo.sv.splunk.com', u'_sourcetype': u'okta_demo', u'punct': u'=_=_=', u'gname': u'', u'_indextime': u'1467337748', u'splunk_server_group': u'', u'tag': u'', u'linecount': u'1', u'_cd': u'899:181', u'product': u'', u'vendor': u'', u'ids_type': u'', u'source': u'/Users/zhanghong/Downloads/okta_demo_cases', u'timestamp': u'none'}, u'configuration': {u'group_id': u'00g17z5bhl0Dpv2FF1d8', u'action': u'add', u'user_id': u'00u17z584iaBW2Biz1d8'},
u'owner': u'admin',
u'results_link': u'http://hozhang-mbpo.sv.splunk.com:8000/app/search/search?q=%7Cloadjob%20scheduler__admin__search__RM...',
u'session_key': u'e6w4SwfYg5BLuXZ6u78^TMWz1rdMGzSbpIWD8kv0SzFIyuuCt_qk2Lxv1zOzC4vue7OaWGVggaLJN5tyn_uQSE_rLm^l3Z0TA8UNmX1TamWTDsAR9kdtCL67Vz0trb3wfMrWFkYOR3mUur0',
u'app': u'search',
u'server_uri': u'https://127.0.0.1:8089',
u'search_name': u'demo_okta_alert_002'
}
    '''
    def __init__(self, settings, logger, action_name='unknown'):
        self.settings      = json.loads(settings)
        self.logger        = logger
        self.session_key   = self.settings.get('session_key')
        self.sid           = self.settings.get('sid')
        ## if sid contains rt_scheduler with snapshot-sid; drop snapshot-sid
        ## sometimes self.sid may be an integer (1465593470.1228)
        try:
            rtsid    = re.match('^(rt_scheduler.*)\.\d+$', self.sid)
            if rtsid:
                self.sid = rtsid.group(1)
        except:
            pass
        self.orig_sid      = ''
        self.rid           = ''
        self.orig_rid      = ''
        self.results_file  = self.settings.get('results_file')
        self.search_name   = self.settings.get('search_name')
        self.app           = self.settings.get('app')
        self.user          = self.settings.get('user') or self.settings.get('owner')
        self.configuration = self.settings.get('configuration', {})
        ## enforce configuration is a 'dict'
        if not isinstance(self.configuration, dict):
            self.configuration = {}
        ## set loglevel to DEBUG if verbose
        if normalizeBoolean(self.configuration.get('verbose', 'false')):
            self.logger.setLevel(logging.DEBUG)
            self.logger.debug("loglevel set to DEBUG")
        ## use | sendalert param.action_name=$action_name$
        self.action_name = self.configuration.get('action_name') or action_name
        ## use search_name to determine action_mode
        if self.search_name:
            self.action_mode = 'saved'
        else:
            self.action_mode = 'adhoc'

        self.action_status = ''
        ## Since we don't use the result object we get from settings it will be purged
        try:
            del self.settings['result']
        except Exception:
            pass

    ## The purpose of this method is to populate the job variable with the contents from REST (/services/search/jobs/<sid>)
    ## SPL-112815 - sendalert - not all $job.<param>$ parameters come through
    def addjobinfo(self):
        self.job = {}
        if self.sid:
            try:
                response, content = rest.simpleRequest('search/jobs/%s' % self.sid, sessionKey=self.session_key, getargs={'output_mode': 'json'})
                if response.status == 200:
                    self.job = json.loads(content)['entry'][0]['content']
                    self.logger.info(self.message('Successfully retrieved search job info'))
                    self.logger.debug(self.job)
                else:
                    self.logger.warn(self.message('Could not retrieve search job info'))
            except Exception as e:
                self.logger.warn(self.message('Could not retrieve search job info'))

    ## The purpose of this method is to provide a common messaging interface
    def message(self, signature, status=None):
        status  = status or self.action_status or ''
        message = ModularAction.DEFAULT_MESSAGE % (signature or '', self.action_name or '', self.search_name or '', self.sid or '', self.orig_sid or '', self.rid or '', self.orig_rid or '', self.app or '', self.user or '', self.action_mode or '', status)
        ## prune empty string key-value pairs
        for match in re.finditer('[A-Za-z_]+=\"\"(\s|$)', message):
            message = message.replace(match.group(0),'',1)
        return message.rstrip()

    ## The purpose of this method is to update per-result ModAction attributes
    def update(self, result):
        ## This is for events/results that were created as the result of a previous action
        self.orig_sid = result.get('orig_sid', '')
        ## This is for events/results that were created as the result of a previous action
        self.orig_rid = result.get('orig_rid', '')
        if 'rid' in result:
            self.rid = result['rid']
        else:
            raise InvalidResultID('Result must have an ID')

    ## The purpose of this method is to generate per-result invocation messages
    def invoke(self):
        self.logger.info(self.message('Invoking modular action'))

    def dowork(self):
        return
