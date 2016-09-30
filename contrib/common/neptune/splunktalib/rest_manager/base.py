"""
Base Handler Class of REST Manager.
"""

import logging
import copy
import itertools
from inspect import ismethod

from splunk import admin, entity, rest, ResourceNotFound, RESTException

from .util import makeConfItem, logger
from .error_ctl import RestHandlerError
from .cred_mgmt import CredMgmt


__all__ = ['BaseRestHandler', 'BaseModel', 'ResourceHandler']


class BaseRestHandler(admin.MConfigHandler):
    """Base Class for Splunk REST Handler.
    """
    
    def __init__(self, *args, **kwargs):
        admin.MConfigHandler.__init__(self, *args, **kwargs)
        assert hasattr(self, "endpoint") , RestHandlerError.ctl(1002, msgx='%s.endpoint' % (self._getHandlerName()), shouldPrint=False, shouldRaise=False)
        assert hasattr(self, "validate") and ismethod(self.validate), RestHandlerError.ctl(1002, msgx='%s.validate' % (self._getHandlerName()), shouldPrint=False, shouldRaise=False)
        assert hasattr(self, "normalize") and ismethod(self.normalize), RestHandlerError.ctl(1002, msgx='%s.normalize' % (self._getHandlerName()), shouldPrint=False, shouldRaise=False)
        
        self.encryptedArgs = set([(self.keyMap.get(arg) or arg) for arg in self.encryptedArgs])
        user, app = self.user_app()
        self._credMgmt = CredMgmt(sessionKey=self.getSessionKey(), user=user, app=app, endpoint=self.endpoint, handler=self._getHandlerName(), encryptedArgs=self.encryptedArgs)

    def setup(self):
        self.checkCustomAction('disable', 'cap4disable')
        self.checkCustomAction('enable', 'cap4enable')

        if self.requestedAction in (admin.ACTION_CREATE, admin.ACTION_EDIT):
            self.setupArgs()
            
    def setupArgs(self):
        if self.requestedAction in [admin.ACTION_CREATE]:
            self._addArgs(reqArgsIter=self.requiredArgs, optArgsIter=itertools.chain(self.optionalArgs, self.transientArgs))

        elif self.requestedAction in [admin.ACTION_EDIT]:
            self._addArgs(optArgsIter=itertools.chain(self.requiredArgs, self.optionalArgs, self.transientArgs))
            
        if self.allowExtra:
            arguments = set(itertools.chain(self.requiredArgs, self.optionalArgs, self.transientArgs))
            extra_args = (arg for arg in self.callerArgs.data.keys() if arg not in arguments)
            self._addArgs(optArgsIter=extra_args)
            
    def _addArgs(self, reqArgsIter = (), optArgsIter = ()):
        for arg in reqArgsIter:
            self.supportedArgs.addReqArg(arg)
        for arg in optArgsIter:
            self.supportedArgs.addOptArg(arg)

    def checkCustomAction(self, action, cap_name):
        if self.customAction != action:
            return
        cap = getattr(self, cap_name, '')
        if not cap:
            RestHandlerError.ctl(1101,
                                 msgx='action=%s' % action,
                                 shouldPrint=True)
        if self.callerArgs.id is None:
            RestHandlerError.ctl(1101,
                                 msgx='None object specified')
        self.customActionCap = cap

    def handleList(self, confInfo):
        if self.callerArgs.id is None:
            ents = self.all()
            for name, ent in ents.items():
                makeConfItem(name, ent, confInfo)
        else:
            try:
                ent = self.get(self.callerArgs.id)
                makeConfItem(self.callerArgs.id, ent, confInfo)
            except ResourceNotFound as exc:
                RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def handleReload(self, confInfo):
        self._reload(confInfo)

    def handleACL(self, confInfo):
        ent = self.get(self.callerArgs.id)
        meta = ent[admin.EAI_ENTRY_ACL]

        if self.requestedAction != admin.ACTION_LIST:

            if self.requestedAction in [admin.ACTION_CREATE, admin.ACTION_EDIT] and len(self.callerArgs.data)>0:
                ent.properties = dict()

                ent['sharing'] = meta['sharing']
                ent['owner'] = meta['owner']

            hasWritePerms = "perms.write" in self.callerArgs
            hasReadPerms = "perms.read" in self.callerArgs
            isPermsPost = hasWritePerms or hasReadPerms

            if "sharing" in self.callerArgs and "user" in self.callerArgs["sharing"] and isPermsPost:
                msg = "ACL cannot be set for user-level sharing"
                logger.error(msg)
                raise Exception(msg)

            perms = meta.get("perms", {})
            # for some reason, this can still return None
            if perms is None:
                perms = {}
            ent['perms.read'] =  perms.get("read", [])
            ent['perms.write'] = perms.get("write", [])

            for k, v in self.callerArgs.data.items():
                ent[k] = v

            entity.setEntity(ent, self.getSessionKey(), uri=ent.id+'/acl')

        confItem = confInfo[self.callerArgs.id]
        acl = copy.deepcopy(meta)
        confItem.actions = self.requestedAction
        confItem.setMetadata(admin.EAI_ENTRY_ACL, acl)
        self.handleList(confInfo)

    def handleCreate(self, confInfo):
        try:
            self.get(self.callerArgs.id)
        except: pass
        else:
            RestHandlerError.ctl(409, msgx=('object_name=%s' % self.callerArgs.id), logLevel=logging.INFO)
        
        try:
            args = self.encode(self.callerArgs.data)
            self.create(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except Exception as exc:
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def handleRemove(self, confInfo):
        try:
            self.delete(self.callerArgs.id)
        except Exception as exc:
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)
        self._credMgmt.delete(self.callerArgs.id)

    def handleEdit(self, confInfo):
        try:
            self.get(self.callerArgs.id)
        except Exception as exc:
            RestHandlerError.ctl(-1, msgx=exc, logLevel=logging.INFO)
            
        try:
            args = self.encode(self.callerArgs.data, setDefault=False)
            self.update(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except Exception as exc:
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def encode(self, args, setDefault=True):
        """Encode request arguments before save it.
        @param args: request arguments.
        @param setDefault: should set default value of missing arguments for the request.
        """
        #set default value if needed
        if setDefault:
            needed_args_iter = itertools.chain(self.requiredArgs, self.optionalArgs)
            args.update({k: [self.defaultVals[k]] for k in needed_args_iter if ((k in self.defaultVals) and (k not in args or args[k]==[None] or args[k]==['']))})
        
        #filter transient arguments & handle none value
        args = {k : v if (v != [None] and v != [""]) else [" "] for k, v in args.items() if k not in self.transientArgs}
        
        #validate
        args = self.validate(args)
        
        #normalize
        args = self.normalize(args)
        
        #Value Mapping
        args = {k:(k in self.valMap and (isinstance(vs, list) and [(v in self.valMap[k] and self.valMap[k][v] or v) for v in vs] or (vs in self.valMap[k] and self.valMap[k][vs] or vs)) or vs) for k,vs in args.items()}
        #Key Mapping
        args = {(k in self.keyMap and self.keyMap[k] or k):vs for k,vs in args.items()}
        
        #encrypt
        args = self._credMgmt.encrypt(self.callerArgs.id, args)
        return args
    
    def decode(self, name, ent):
        #decrypt
        ent = self._credMgmt.decrypt(name, ent)
        
        #Adverse Key Mapping
        ent = {k: v for k, v in ent.iteritems()}
        keyMapAdv = {v: k for k, v in self.keyMap.items()}
        ent_new = {keyMapAdv[k]: vs for k, vs in ent.items() if k in keyMapAdv}
        ent.update(ent_new)

        #Adverse Value Mapping
        valMapAdv = {k:{y:x for x,y in m.items()} for k,m in self.valMap.items()}
        ent = {k:(k in valMapAdv and (isinstance(vs, list) and [(v in valMapAdv[k] and valMapAdv[k][v] or v) for v in vs] or (vs in valMapAdv[k] and valMapAdv[k][vs] or vs)) or vs) for k,vs in ent.items()}
        
        #normalize
        ent = self.normalize(ent)
        
        #filter undesired arguments & handle none value
        return {k: (str(v).lower() if isinstance(v, bool) else v) if (v is not None and str(v).strip()) else '' 
                for k, v in ent.iteritems()
                if k not in self.transientArgs 
                   and (self.allowExtra 
                        or k in self.requiredArgs 
                        or k in self.optionalArgs 
                        or k in self.outputExtraFields) 
                }
    
    def _reload(self, confInfo):
        path = "%s/_reload" % self.endpoint
        response, content = rest.simpleRequest(path, sessionKey=self.getSessionKey(),method='POST')
        if response.status != 200:
            exc=RESTException(response.status, response.messages)
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def handleDisableAction(self, confInfo, disabled):
        self.update(self.callerArgs.id, disabled=disabled)

    def handleCustom(self, confInfo, **params):
        if self.customAction in ['acl']:
            return self.handleACL(confInfo)

        if self.customAction == 'disable':
            self.handleDisableAction(confInfo, '1')
        elif self.customAction == 'enable':
            self.handleDisableAction(confInfo, '0')
        elif self.customAction == "_reload":
            self._reload(confInfo)
        elif self.customAction == "move":
            self.move(confInfo, **params)
        else:
            RestHandlerError.ctl(1101, 'action=%s' % self.customAction, logLevel=logging.INFO)


    def user_app(self):
        app  = self.context != admin.CONTEXT_NONE           and self.appName or "-"
        user = self.context == admin.CONTEXT_APP_AND_USER   and self.userName or "nobody"
        return user, app

    def all(self):
        # count=0 and offset=0 allow the rest handler
        # to perform pagination on the full set of results.
        # The pagination functions expect to apply pagination
        # against the full set of results.
        user, app = self.user_app()
        ents = entity.getEntities(self.endpoint,
                              namespace=app,
                              owner=user,
                              sessionKey=self.getSessionKey(),
                              count=self.maxCount,
                              sort_key=self.sortByKey,
                              sort_dir= self.sortAscending and 'asc' or 'desc',
                              offset=self.posOffset)
        return {name:self.decode(name, ent) for name,ent in ents.items()}

    def get(self, name):
        user, app = self.user_app()
        ent =  entity.getEntity(self.endpoint,
                        name,
                        namespace=app,
                        owner=user,
                        sessionKey=self.getSessionKey())
        return self.decode(name, ent)

    def create(self, name, **params):
        user, app = self.user_app()
        new = entity.Entity(self.endpoint,
                        "_new",
                        namespace=app,
                        owner=user)

        try:
            new["name"] = name
            for arg, val in params.items():
                new[arg] = val
            entity.setEntity(new, sessionKey=self.getSessionKey())
        except Exception as exc:
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def delete(self, name):
        user, app = self.user_app()
        entity.deleteEntity(self.endpoint,
                        name,
                        namespace=app,
                        owner=user,
                        sessionKey=self.getSessionKey())
        
    def update(self, name, **params):
        user, app = self.user_app()
        try:
            ent = entity.getEntity(self.endpoint,
                               name,
                               namespace=app,
                               owner=user,
                               sessionKey=self.getSessionKey())

            for arg, val in params.items():
                ent[arg] = val

            entity.setEntity(ent, sessionKey=self.getSessionKey())
        except Exception as exc:
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)

    def getCallerArgs(self):
        callargs = dict()
        for n, v in self.callerArgs.data.items():
            callargs.update({n : v[0]})

        return callargs

    def move(self, confInfo, **params):
        user, app = self.user_app()
        args = self.getCallerArgs()
        if hasattr(self, 'encode'):
            args = self.encode(args)

        postArgs = {
            "app" : args["app"],
            "user" : args["user"]
        }
        path = entity.buildEndpoint(self.endpoint,
                                entityName=self.callerArgs.id,
                                namespace=app,
                                owner=user)
        path += "/move"

        response, content = rest.simpleRequest(path, 
            sessionKey=self.getSessionKey(), 
            method='POST',
            postargs=postArgs)
        if response.status != 200:
            exc=RESTException(response.status, response.messages)
            RestHandlerError.ctl(-1, exc, logLevel=logging.INFO)
            
    def _getHandlerName(self):
        return self.__class__.__name__



class BaseModel(object):
    """Model of Data.
    It ensure that key/value stored in *.conf are mapped to storage key/value, key/value shown to user are mapped to interface key/value.
    """
    endpoint        = "configs/conf-model_conf_name"
    #Argument names (all argument names should be interface keys, which are shown to user)
    requiredArgs    = set() #arguments are required.
    optionalArgs    = set() #arguments are optional.
    transientArgs   = set() #arguments will be ignored (not saved).
    encryptedArgs   = set() #arguments need to be encrypted.
    allowExtra      = False #is extra parameters to persist allowed.
    
    defaultVals     = {}    #default values for some fields.
    validators      = {}    #validators specified for fields
    normalisers     = {}    #normalisers specified for fields
    keyMap          = {}    #arguments' name mapping: interface key ==> storage key
    valMap          = {}    #arguments' value mapping
    
    outputExtraFields = ('disabled', 'eai:acl', 'acl', 'eai:appName', 'eai:userName')

    # Custom Actions
    cap4disable = ''
    cap4enable = ''
    
    
    def validate(self, args):
        """Validate request arguments.
        """
        for k,vs in args.items():
            if not k in self.validators:
                continue
            if not isinstance(vs, list):
                vs = [vs]
            for v in vs:
                if not self.validators[k].validate(v):
                    RestHandlerError.ctl(1100, msgx='field_name=%s' % k, logLevel=logging.INFO)
        return args

    def normalize(self, data):
        """Normalize request arguments or response data.
        """
        for k,vs in data.items():
            if k not in self.normalisers:
                continue
            if isinstance(vs, list) or isinstance(vs, dict) or isinstance(vs, tuple):
                data[k]=[isinstance(v, basestring) and self.normalisers[k].normalize(v) or v for v in vs]
            else:
                data[k]=self.normalisers[k].normalize(vs)
        return data


def ResourceHandler(model, handler=BaseRestHandler):
    return type(handler.__name__, (handler, model), {})

