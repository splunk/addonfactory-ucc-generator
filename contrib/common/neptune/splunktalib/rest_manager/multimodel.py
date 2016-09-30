
import logging

import splunk.admin as admin

from . import base, error_ctl, cred_mgmt

__all__ = ['MultiModelRestHandler', 'MultiModel', 'ResourceHandler']


class MultiModelRestHandler(base.BaseRestHandler):
    '''Rest handler for multiple models with different fields, and different validation.
    '''
    
    def __init__(self, *args, **kwargs):
        admin.MConfigHandler.__init__(self, *args, **kwargs)
        
        assert hasattr(self, "endpoint") , error_ctl.RestHandlerError.ctl(1002, msgx='%s.endpoint' % (self.__class__.__name__), shouldPrint=False, shouldRaise=False)
        assert hasattr(self, "modelMap") and isinstance(self.modelMap, dict), error_ctl.RestHandlerError.ctl(1002, msgx='%s.modelMap' % (self.__class__.__name__), shouldPrint=False, shouldRaise=False)
        
        if self.callerArgs.id:
            self.model = self.setModel(self.callerArgs.id)
        else:
            error_ctl.RestHandlerError.ctl(400, msgx='It is not supported to access to multiple-model handler without an object name - endpoint: {}'.format(self.endpoint), logLevel=logging.INFO)
        
        self.encryptedArgs = set([(self.keyMap.get(arg) or arg) for arg in self.encryptedArgs])
        user, app = self.user_app()
        self._credMgmt = cred_mgmt.CredMgmt(sessionKey=self.getSessionKey(), user=user, app=app, endpoint=self.endpoint, handler=self._getHandlerName(), encryptedArgs=self.encryptedArgs)
    
#     def all(self):
#         return {name:self.get(name) for name in self.modelMap}
    
    def setModel(self, objectID):
        '''Get data model for specified object.
        '''
        Model = self.modelMap.get(objectID)
        assert Model and issubclass(Model, base.BaseModel), error_ctl.RestHandlerError.ctl(1001, msgx='wrong model for object=%s' % (self.callerArgs.id), shouldPrint=False, shouldRaise=False)
        
        modelObj = Model()
        attrs = {attr:getattr(modelObj, attr, None) for attr in dir(modelObj) if not attr.startswith('__') and attr!='endpoint'}
        self.__dict__.update(attrs)
        return Model
        
#     def decode(self, name, ent):
#         self.setModel(name) #set model attribute for normalize response data
#         return base.BaseRestHandler.decode(self, name, ent)
            
    def _getHandlerName(self):
        return '%s.%s' % (self.__class__.__name__, self.model.__name__)
    

class MultiModel(object):
    '''Mapping from object name to model, which means stanzas with different structure will be stored in same endpoint.
    '''
    endpoint    = "configs/conf-multimodel_conf_name"
    modelMap    = {}    #model mapping
    


def ResourceHandler(multimodel, handler=MultiModelRestHandler):
    return type(handler.__name__, (handler, multimodel), {})

