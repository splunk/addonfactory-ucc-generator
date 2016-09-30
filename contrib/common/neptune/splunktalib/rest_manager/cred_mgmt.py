"""Credential Management for REST Endpoint
"""

import json
import urllib

from splunk import rest

from .util import getBaseAppName
from .error_ctl import RestHandlerError


class CredMgmt(object):
    
    ENCRYPTED_MAGIC_TOKEN = "********"
    REALM_TEMPLATE = "__REST_CREDENTIAL__#{baseApp}#{endpoint}#{handler}"
    
    def __init__(self, sessionKey, user, app, endpoint, handler, encryptedArgs):
        self._sessionKey = sessionKey
        self._baseApp=getBaseAppName()
        self._user, self._app = user, app
        self._endpoint, self._handler = endpoint, handler
        self._encryptedArgs = set(encryptedArgs)
        self._realm = CredMgmt.REALM_TEMPLATE.format(baseApp=self._baseApp, endpoint=endpoint, handler=handler)
    
    def encrypt(self, name, data):
        '''Encrypt data with given fields.
        '''
        if not self._encryptedArgs:
            return data
        
        encryptingDict = self.decrypt(name, {})
        encryptingDict.update({arg:(val[0] if isinstance(val, list) else val) for arg,val in data.items() if arg in self._encryptedArgs})
        self.delete(name)
        postArgs = {
                    'name': name,
                    'password': json.dumps(encryptingDict),
                    'realm': self._realm
                    }
        try:
            rest.simpleRequest(self._makeRequestURL(name), sessionKey=self._sessionKey, method='POST', postargs=postArgs, raiseAllErrors=True)
            data.update({arg:CredMgmt.ENCRYPTED_MAGIC_TOKEN for arg in data if arg in self._encryptedArgs})
        except Exception as exc:
            RestHandlerError.ctl(1020, msgx=self._getErrMsg(exc, name), shouldPrint=False, shouldRaise=False)
        return data

    def decrypt(self, name, data):
        '''Decrypt data with given fields.
        '''
        if not self._encryptedArgs:
            return data
        
        nonEncrypted = {arg:(val[0] if isinstance(val, list) else val) for arg,val in data.items() if arg in self._encryptedArgs and data[arg]!=CredMgmt.ENCRYPTED_MAGIC_TOKEN}
        try:
            response, content = rest.simpleRequest(self._makeRequestURL(name, isNew=False), sessionKey=self._sessionKey, method='GET', raiseAllErrors=True)
            cred = json.loads(content)['entry'][0]['content']['clear_password']
            cred = json.loads(cred)
            for arg,val in cred.items():
                data[arg] = val if (arg in self._encryptedArgs) and (arg not in nonEncrypted) else data[arg]
                    
        except Exception as exc:
            RestHandlerError.ctl(1021, msgx=self._getErrMsg(exc, name), shouldPrint=False, shouldRaise=False)
        
        # check if it is added into *.conf manually by user.
        if nonEncrypted:
            self.encrypt(name, data)
        return data
    
    def delete(self, name):
        '''Delete encrypted data.
        '''
        try:
            rest.simpleRequest(self._makeRequestURL(name, isNew=False), sessionKey=self._sessionKey, method='DELETE', raiseAllErrors=True)
        except Exception as exc:
            RestHandlerError.ctl(1022, msgx=self._getErrMsg(exc, name), shouldPrint=False, shouldRaise=False)
            return False
        return True
    
    @staticmethod
    def _escapeString(stringToEscape):
        """
        Splunk secure credential storage actually requires a custom style of
        escaped string where all the :'s are escaped by a single \.
        But don't escape the control : in the 'username' in 'storage/passwords'.
        """
        return stringToEscape.replace(":", "\\:").replace("/", "%2F")
    
    def _getErrMsg(self, error, name):
        errMsgDict = {
                    'base_app': self._baseApp,
                    'endpoint': self._endpoint,
                    'handler': self._handler,
                    'encrypted_args': list(self._encryptedArgs),
                    'name': name,
                    'error': str(error)
                   }
        return json.dumps(errMsgDict)
    
    def _makeRequestURL(self, name, isNew=True):
        credId = '' if isNew else urllib.quote('{realm}:{username}:'.format(realm=CredMgmt._escapeString(self._realm), username=CredMgmt._escapeString(name)))
        return "{splunkMgmtUri}/servicesNS/{user}/{app}/storage/passwords/{credId}?output_mode=json".format(splunkMgmtUri=rest.makeSplunkdUri(), user=self._user, app=self._app, credId=credId)

