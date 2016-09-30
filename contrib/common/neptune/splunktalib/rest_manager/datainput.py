"""
REST Manager for data inputs (a wrapper of data inputs).
"""

import json
import logging
import collections
from urllib import quote

from splunk import admin, rest

from . import base, error_ctl, util


__all__ = ['DataInputHandler', 'DataInputModel']


class DataInputHandler(base.BaseRestHandler):
    """A Wraper of Splunk Data Input REST.
    """

    def __init__(self, *args, **kwargs):
        base.BaseRestHandler.__init__(self, *args, **kwargs)
        assert hasattr(self, "dataInputName") and self.dataInputName, error_ctl.RestHandlerError.ctl(1002, msgx='%s.dataInputName' % self._getHandlerName(), shouldPrint=False, shouldRaise=False)

    def handleCreate(self, confInfo):
        args = self.encode(self.callerArgs.data)
        args['name'] = self.callerArgs.id
        try:
            rest.simpleRequest(self.makeRequestURL(), sessionKey=self.getSessionKey(), postargs=args, method='POST', raiseAllErrors=True)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def handleEdit(self, confInfo):
        args = self.encode(self.callerArgs.data, setDefault=True)
        try:
            rest.simpleRequest(self.makeRequestURL(), sessionKey=self.getSessionKey(), postargs=args, method='POST', raiseAllErrors=True)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def handleList(self, confInfo):
        user, app = self.user_app()
        get_args = {
            'count': 0,
            'sort_key': self.sortByKey,
            'sort_dir': self.sortAscending and 'asc' or 'desc',
            'offset': self.posOffset,
            'output_mode': 'json'
        }

        try:
            url = self.makeRequestURL().replace('?output_mode=json', '')
            response, content = rest.simpleRequest(url,
                                                   sessionKey=self.getSessionKey(),
                                                   method='GET',
                                                   getargs=get_args,
                                                   raiseAllErrors=True)
            res = json.loads(content)
            if 'entry' in res:
                for entry in res['entry']:
                    name = entry['name']
                    ent = entry['content']
                    ent[admin.EAI_ENTRY_ACL] = entry['acl']
                    ent = self.convert(ent)
                    ent = self.decode(name, ent)
                    util.makeConfItem(name, ent, confInfo, user=user, app=app)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def handleRemove(self, confInfo):
        try:
            rest.simpleRequest(self.makeRequestURL(), sessionKey=self.getSessionKey(), method='DELETE', raiseAllErrors=True)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def handleCustom(self, confInfo, **params):
        if self.customAction in ['acl']:
            return self.handleACL(confInfo)

        if self.customAction == 'disable':
            self.handleDisable(confInfo)
        elif self.customAction == 'enable':
            self.handleEnable(confInfo)
        else:
            error_ctl.RestHandlerError.ctl(-1, msgx='action=%s' % self.customAction, logLevel=logging.INFO)

    def handleDisable(self, confInfo):
        try:
            rest.simpleRequest(self.makeRequestURL().replace('?output_mode=json', '/disable?output_mode=json'), sessionKey=self.getSessionKey(), method='POST', raiseAllErrors=True)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def handleEnable(self, confInfo):
        try:
            rest.simpleRequest(self.makeRequestURL().replace('?output_mode=json', '/enable?output_mode=json'), sessionKey=self.getSessionKey(), method='POST', raiseAllErrors=True)
        except Exception as exc:
            error_ctl.RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
        return

    def makeRequestURL(self):
        user, app = self.user_app()
        eid = None if self.callerArgs.id is None else quote(self.callerArgs.id.encode('utf-8'), safe='')
        name = (self.requestedAction in (admin.ACTION_EDIT, admin.ACTION_LIST, admin.ACTION_REMOVE) and self.callerArgs.id is not None) and ('/' + eid) or ''
        return rest.makeSplunkdUri() + 'servicesNS/'+ user +'/'+ app + '/data/inputs/' + self.dataInputName + name + '?output_mode=json'

    def convertErrMsg(self, errMsg):
        err=json.loads(errMsg)
        return err['messages'][0]['text']

    def convert(self, data):
        if isinstance(data, basestring):
            return data.encode('utf-8')
        elif isinstance(data, collections.Mapping):
            return dict(map(self.convert, data.iteritems()))
        elif isinstance(data, collections.Iterable):
            return type(data)(map(self.convert, data))
        else:
            return data


class DataInputModel(base.BaseModel):
    '''Base Class of AWS Input Model.
    '''
    dataInputName = '' #For Splunkd data/input TEST API: servicesNS/<user>/<app>/data/inputs/<dataInputName>
