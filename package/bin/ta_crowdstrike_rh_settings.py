import os
import sys
import splunk.admin as admin
LIB_FOLDER_NAME = 'splunk_ta_crowdstrike'
folder_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(folder_path, LIB_FOLDER_NAME))
from splunktaucclib.rest_handler import base, multimodel, normaliser, validator
from splunktaucclib.rest_handler.cred_mgmt import CredMgmt
from splunktaucclib.rest_handler.error_ctl import RestHandlerError as RH_Err
from splunktalib.common import util


util.remove_http_proxy_env_vars()


class CrowdstrikeCredMgmt(CredMgmt):
    def context(self, _, data=None):
        return ('Splunk_TA_crowdstrike', '__Splunk_TA_proxy__', '', )


class CrowdstrikeSettingsHandler(multimodel.MultiModelRestHandler):
    def setModel(self, name):
        """Get data model for specified object.
        """
        # get model for object
        if name not in self.modelMap:
            RH_Err.ctl(404, msgx='object={name}'.format(name=name, handler=self.__class__.__name__))
        self.model = self.modelMap[name]

        # load attributes from model
        obj = self.model()
        attributes = {attr: getattr(obj, attr, None) for attr in dir(obj)
                      if not attr.startswith('__') and attr not in
                      ('endpoint', 'rest_prefix', 'cap4endpoint', 'cap4get_cred')}
        self.__dict__.update(attributes)

        # credential fields
        self.encryptedArgs = set([(self.keyMap.get(arg) or arg)
                                  for arg in self.encryptedArgs])
        user, app = self.user_app()
        self._cred_mgmt = CrowdstrikeCredMgmt(
            sessionKey=self.getSessionKey(), user=user, app=app, endpoint=self.endpoint,
            encryptedArgs=self.encryptedArgs)


class Logging(base.BaseModel):
    requiredArgs = {'loglevel'}
    defaultVals = {'loglevel': 'INFO'}
    validators = {'loglevel': validator.Enum(('DEBUG', 'INFO', 'ERROR'))}
    outputExtraFields = ('eai:acl', 'acl', 'eai:attributes', 'eai:appName', 'eai:userName')


class Proxy(base.BaseModel):
    requiredArgs = {'proxy_enabled', }
    optionalArgs = {'proxy_url', 'proxy_port', 'proxy_username', 'proxy_password', 'proxy_type'}
    encryptedArgs = {'proxy_username', 'proxy_password'}
    defaultVals = {'proxy_enabled': 'false', 'proxy_type': 'http'}
    validators = {
        'proxy_enabled': validator.RequiredIf(('proxy_url', 'proxy_port'), ('1', 'true', 'yes')),
        'proxy_url': validator.AllOf(validator.Host(), validator.RequiredIf(('proxy_port', ))),
        'proxy_port': validator.AllOf(validator.Port(), validator.RequiredIf(('proxy_url', ))),
        'proxy_type': validator.Enum(("socks4", "socks5", "http"))
    }
    normalisers = {'proxy_enabled': normaliser.Boolean(), }
    outputExtraFields = ('eai:acl', 'acl', 'eai:attributes', 'eai:appName', 'eai:userName')


class Setting(multimodel.MultiModel):
    endpoint = "configs/conf-crowdstrike"
    modelMap = {
        'proxy': Proxy,
        'loglevel': Logging
    }
    cap4endpoint = ''
    cap4get_cred = ''


if __name__ == "__main__":
    admin.init(multimodel.ResourceHandler(Setting, handler=CrowdstrikeSettingsHandler),
               admin.CONTEXT_APP_AND_USER)
