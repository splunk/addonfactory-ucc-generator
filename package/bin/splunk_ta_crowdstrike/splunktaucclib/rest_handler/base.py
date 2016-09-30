"""Base Handler Class of REST Manager.
"""

from __future__ import absolute_import

import logging
import json
import copy
import itertools
from inspect import ismethod
from os import path as op

from splunk import admin, entity, rest, ResourceNotFound, RESTException
from splunktalib.common import util as sc_util

import splunktaucclib.common.log as stulog
import splunktaucclib.rest_handler.util as ucc_rh_util
from splunktaucclib.rest_handler.error_ctl import RestHandlerError as RH_Err
from splunktaucclib.rest_handler.cred_mgmt import CredMgmt


__all__ = ['BaseRestHandler', 'BaseModel', 'ResourceHandler']


APP_NAME = sc_util.get_appname_from_path(op.abspath(__file__))


def get_entities(endpoint, session_key, user, app, get_args):
    url = rest.makeSplunkdUri() + 'servicesNS/' + user + '/' + app + \
          '/' + endpoint
    try:
        response, content = rest.simpleRequest(
            url, sessionKey=session_key,
            method='GET', getargs=get_args,
            raiseAllErrors=True,
        )
        res = json.loads(content)
        if 'entry' in res:
            return {entry['name']: entry['content'] for entry in res['entry']}
        else:
            return {}
    except Exception as exc:
        RH_Err.ctl(-1, msgx=exc, logLevel=logging.INFO)
    return


class BaseRestHandler(admin.MConfigHandler):
    """Base Class for Splunk REST Handler.

    Note: It gets a mask for encrypted fields by default.
    But you will get clear password with field ``--get-clear-credential--``
    equalling to ``1`` in request. This is for back-end.
    """

    # not allowed object name while creating
    NOT_ALLOWED_NAME = {'default'}

    def __init__(self, *args, **kwargs):
        admin.MConfigHandler.__init__(self, *args, **kwargs)
        self._log_request()

        # check required attributes
        assert getattr(self, "endpoint", ''), \
            RH_Err.ctl(1002,
                       msgx='%s.endpoint' % (self._getHandlerName()),
                       shouldPrint=False)
        assert hasattr(self, "validate") and ismethod(self.validate), \
            RH_Err.ctl(1002,
                       msgx='%s.validate' % (self._getHandlerName()),
                       shouldPrint=False)
        assert hasattr(self, "normalize") and ismethod(self.normalize), \
            RH_Err.ctl(1002,
                       msgx='%s.normalize' % (self._getHandlerName()),
                       shouldPrint=False)

        # check object name while creating
        self.check_name()

        # check capabilities of sessioned user
        self.check_caps()

        # Check if entry exists for "_sync"
        if self.customAction == '_sync':
            try:
                self.get(self.callerArgs.id)
            except ResourceNotFound:
                self.exist4sync = False
            except Exception, exc:
                RH_Err.ctl(1102,
                           msgx='object=%s, err=%s' %
                                (self.callerArgs.id, exc))
            else:
                self.exist4sync = True
        self._cred_mgmt = self.get_cred_mgmt(self.endpoint)

    def setup(self):
        if self.customAction == '_sync':
            action = admin.ACTION_EDIT if self.exist4sync \
                else admin.ACTION_CREATE
            self.setupArgs(action)
        elif self.requestedAction in (admin.ACTION_CREATE, admin.ACTION_EDIT):
            self.setupArgs(self.requestedAction)
        elif self.requestedAction == admin.ACTION_LIST:
            self.supportedArgs.addOptArg('--get-clear-credential--')

    def setupArgs(self, action):
        if action in [admin.ACTION_CREATE]:
            self._addArgs(reqArgsIter=self.requiredArgs,
                          optArgsIter=itertools.chain(self.optionalArgs,
                                                      self.transientArgs))
        elif action in [admin.ACTION_EDIT]:
            self._addArgs(optArgsIter=itertools.chain(self.requiredArgs,
                                                      self.optionalArgs,
                                                      self.transientArgs))
        if self.allowExtra:
            arguments = set(itertools.chain(self.requiredArgs,
                                            self.optionalArgs,
                                            self.transientArgs))
            extra_args = (arg for arg in self.callerArgs.data.keys()
                          if arg not in arguments)
            self._addArgs(optArgsIter=extra_args)

    def _addArgs(self, reqArgsIter=(), optArgsIter=()):
        for arg in reqArgsIter:
            self.supportedArgs.addReqArg(arg)
        for arg in optArgsIter:
            self.supportedArgs.addOptArg(arg)

    def check_caps(self):
        current_caps = ucc_rh_util.user_caps(
            rest.makeSplunkdUri(),
            self.getSessionKey(),
        )

        cap4endpoint = self.rest_prefix + '_' + self.cap4endpoint \
            if self.cap4endpoint else ''
        if cap4endpoint and cap4endpoint not in current_caps:
            RH_Err.ctl(403,
                       msgx='capability=' + cap4endpoint,
                       logLevel=logging.INFO)
        if 0 < len(self.customAction):
            self.customActionCap = cap4endpoint

        cap4get_cred = self.rest_prefix + '_' + self.cap4get_cred \
            if self.cap4get_cred else ''
        if '--get-clear-credential--' in self.callerArgs.data and \
                cap4get_cred and cap4get_cred not in current_caps:
            RH_Err.ctl(403,
                       msgx='capability=' + cap4get_cred,
                       logLevel=logging.INFO)

    def get_cred_mgmt(self, endpoint):
        # credential fields
        self.encryptedArgs = set([(self.keyMap.get(arg) or arg)
                                  for arg in self.encryptedArgs])
        user, app = self.user_app()
        return CredMgmt(sessionKey=self.getSessionKey(),
                        user=user, app=app,
                        endpoint=endpoint,
                        encryptedArgs=self.encryptedArgs)

    def handleList(self, confInfo):
        user, app = self.user_app()

        # reload the conf before reading it
        try:
            entity.refreshEntities(
                self.endpoint,
                namespace=app,
                owner=user,
                sessionKey=self.getSessionKey()
            )
        except Exception, exc:
            RH_Err.ctl(
                1023,
                msgx=exc,
                logLevel=logging.INFO,
                shouldPrint=False,
                shouldRaise=False,
            )

        # read conf
        if self.callerArgs.id is None:
            ents = self.all()
            for name, ent in ents.items():
                ucc_rh_util.make_conf_item(confInfo[name], ent,
                                           user=user, app=app)
        else:
            try:
                ent = self.get(self.callerArgs.id)
                ucc_rh_util.make_conf_item(confInfo[self.callerArgs.id], ent,
                                           user=user, app=app)
            except ResourceNotFound as exc:
                RH_Err.ctl(-1, exc, logLevel=logging.INFO)

    def handleReload(self, confInfo):
        self._reload(confInfo)

    def handleACL(self, confInfo):
        ent = self.get(self.callerArgs.id)
        meta = ent[admin.EAI_ENTRY_ACL]

        if self.requestedAction != admin.ACTION_LIST:

            if self.requestedAction in [admin.ACTION_CREATE,
                                        admin.ACTION_EDIT] \
                    and len(self.callerArgs.data) > 0:
                ent.properties = dict()

                ent['sharing'] = meta['sharing']
                ent['owner'] = meta['owner']

            hasWritePerms = "perms.write" in self.callerArgs
            hasReadPerms = "perms.read" in self.callerArgs
            isPermsPost = hasWritePerms or hasReadPerms

            if "sharing" in self.callerArgs \
                    and "user" in self.callerArgs["sharing"] \
                    and isPermsPost:
                msg = "ACL cannot be set for user-level sharing"
                stulog.logger.error(msg)
                raise Exception(msg)

            perms = meta.get("perms", {})
            # for some reason, this can still return None
            if perms is None:
                perms = {}
            ent['perms.read'] = perms.get("read", [])
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
        except:
            pass
        else:
            RH_Err.ctl(409,
                       msgx=('object=%s' % self.callerArgs.id),
                       logLevel=logging.INFO)

        try:
            args = self.encode(self.callerArgs.data)
            self.create(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except Exception as exc:
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

    def handleRemove(self, confInfo):
        try:
            self.delete(self.callerArgs.id)
        except Exception as exc:
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)
        self._cred_mgmt.delete(self._makeStanzaName(self.callerArgs.id))

    def handleEdit(self, confInfo):
        try:
            self.get(self.callerArgs.id)
        except Exception as exc:
            RH_Err.ctl(-1, msgx=exc, logLevel=logging.INFO)

        try:
            args = self.encode(self.callerArgs.data, setDefault=False)
            self.update(self.callerArgs.id, **args)
            self.handleList(confInfo)
        except Exception as exc:
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

    def encode(self, args, setDefault=True):
        """Encode request arguments before save it.

        :param args: request arguments.
        :param setDefault: should set default value of missing arguments
        for the request. It is ``True`` for CREATE, ``False`` for EDIT.
        """
        # filter transient arguments & handle none value
        args = {key: '' if (val is None or val[0] is None) else val[0]
                for key, val in args.iteritems()
                if key not in self.transientArgs}

        # set default value if needed
        if setDefault:
            needed_args_iter = itertools.chain(self.requiredArgs,
                                               self.optionalArgs)
            args.update({k: [self.defaultVals[k]] for k in needed_args_iter
                         if k in self.defaultVals and not args.get(k)})

        # validate
        args = self.validate(args)

        # normalize
        args = self.normalize(args)

        # Value Mapping
        args = {k: ([(self.valMap[k].get(v) or v)
                     for v in (vs if isinstance(vs, list) else [vs])]
                    if k in self.valMap else vs)
                for k, vs in args.items()}
        # Key Mapping
        args = {(k in self.keyMap and self.keyMap[k] or k): vs
                for k, vs in args.items()}

        # encrypt
        tanzaName = self._makeStanzaName(self.callerArgs.id)
        args = self._cred_mgmt.encrypt(tanzaName, args)
        return args

    def decode(self, name, ent):
        """Decode data before return it.

        :param name:
        :param ent:
        :return:
        """
        # Automatically encrypt credential information
        # It is for manually edited *.conf file
        ent = self._auto_encrypt(name, ent)

        # decrypt
        if self.callerArgs.data.get('--get-clear-credential--') == ['1']:
            try:
                ent = self._cred_mgmt.decrypt(self._makeStanzaName(name), ent)
            except ResourceNotFound:
                RH_Err.ctl(1021,
                           msgx='endpoint=%s, item=%s' % (self.endpoint, name),
                           shouldPrint=False,
                           shouldRaise=False)
        else:
            ent = {key: val for key, val in ent.iteritems()
                   if key not in self.encryptedArgs}

        # Adverse Key Mapping
        ent = {k: v for k, v in ent.iteritems()}
        keyMapAdv = {v: k for k, v in self.keyMap.items()}
        ent_new = {keyMapAdv[k]: vs for k, vs in ent.items() if k in keyMapAdv}
        ent.update(ent_new)

        # Adverse Value Mapping
        valMapAdv = {k: {y: x for x, y in m.items()}
                     for k, m in self.valMap.items()}
        ent = {k: (([(valMapAdv[k].get(v) or v) for v in vs]
                    if isinstance(vs, list) else (valMapAdv[k].get(vs) or vs))
                   if k in valMapAdv else vs)
               for k, vs in ent.items()}

        # normalize
        ent = self.normalize(ent)

        # filter undesired arguments & handle none value
        return {k: ((str(v).lower() if isinstance(v, bool) else v)
                    if (v is not None and str(v).strip()) else '')
                for k, v in ent.iteritems()
                if k not in self.transientArgs and (
                    self.allowExtra or
                    k in self.requiredArgs or
                    k in self.optionalArgs or
                    k in self.outputExtraFields)
                }

    def _auto_encrypt(self, name, ent):
        cred_data = {key: val for key, val in ent.iteritems()
                     if key in self.encryptedArgs and
                     val != CredMgmt.PASSWORD_MASK}
        if cred_data:
            ent = self._cred_mgmt.encrypt(self._makeStanzaName(name), ent)
            args = {key: val for key, val in ent.iteritems()
                    if key in self.encryptedArgs and
                    cred_data.get(key, '')}
            self.update(name, **args)
        return ent

    def _makeStanzaName(self, name):
        """Make the stanza name to store credential information
        in passwords.conf.

        :param name: the entry name
        :return:
        """
        return name

    def _reload(self, confInfo):
        path = "%s/_reload" % self.endpoint
        response, _ = rest.simpleRequest(path,
                                         sessionKey=self.getSessionKey(),
                                         method='POST')
        if response.status != 200:
            exc = RESTException(response.status, response.messages)
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

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
        elif self.customAction == '_sync':
            self.handleSyncAction(confInfo, **params)
        else:
            RH_Err.ctl(1101,
                       'action=%s' % self.customAction,
                       logLevel=logging.INFO)

    def user_app(self):
        """Get context info: user/app or namespace/owner
        """
        app = self.context != admin.CONTEXT_NONE and self.appName or "-"
        user = (self.context == admin.CONTEXT_APP_AND_USER and
                self.userName or "nobody")
        return user, app

    def all(self):
        # count=0 and offset=0 allow the rest handler
        # to perform pagination on the full set of results.
        # The pagination functions expect to apply pagination
        # against the full set of results.
        user, app = self.user_app()
        get_args = {
            'output_mode': 'json',
        }
        ents = get_entities(
            self.endpoint, self.getSessionKey(), user, app, get_args
        )
        return {name: self.decode(name, ent) for name, ent in ents.items()}

    def get(self, name):
        user, app = self.user_app()
        ent = entity.getEntity(self.endpoint,
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
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

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
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

    def getCallerArgs(self):
        callargs = dict()
        for n, v in self.callerArgs.data.items():
            callargs.update({n: v[0]})
        return callargs

    def move(self, confInfo, **params):
        user, app = self.user_app()
        args = self.getCallerArgs()
        if hasattr(self, 'encode'):
            args = self.encode(args)

        postArgs = {
            "app": args["app"],
            "user": args["user"]
        }
        path = entity.buildEndpoint(self.endpoint,
                                    entityName=self.callerArgs.id,
                                    namespace=app,
                                    owner=user)
        path += "/move"

        response, _ = rest.simpleRequest(path,
                                         sessionKey=self.getSessionKey(),
                                         method='POST',
                                         postargs=postArgs)
        if response.status != 200:
            exc = RESTException(response.status, response.messages)
            RH_Err.ctl(-1, exc, logLevel=logging.INFO)

    def handleSyncAction(self, confInfo, **params):
        if self.exist4sync:
            self.handleEdit(confInfo)
        else:
            self.handleCreate(confInfo)

    def _getHandlerName(self):
        return self.__class__.__name__

    def _log_request(self):
        actions = {
            admin.ACTION_CREATE: 'create',
            admin.ACTION_LIST: 'list',
            admin.ACTION_EDIT: 'edit',
            admin.ACTION_REMOVE: 'remove',
            admin.ACTION_MEMBERS: 'members',
            admin.ACTION_RELOAD: 'reload',
        }

        msg = ('REST Request: '
               'endpoint={endpoint}, '
               'entry={entry}, '
               'action={action}, '
               'custom_action={custom_action}, '
               'args={args}, '
               'mode={mode}'
               .format(endpoint=self.endpoint,
                       entry=self.callerArgs.id,
                       action=actions.get(self.requestedAction, None),
                       custom_action=self.customAction,
                       args=json.dumps([arg for arg in self.callerArgs.data]),
                       mode=self._mode,
                       ))
        if self.requestedAction == admin.ACTION_LIST:
            stulog.logger.debug(msg)
        else:
            stulog.logger.info(msg)

    def check_name(self):
        """
        Check if the object name is valid while creating.
        :return:
        """
        if (self.requestedAction != admin.ACTION_CREATE or
                    self.callerArgs.id is None):
            return

        # not allow to create object with name starting with '_'
        if self.callerArgs.id.startswith('_'):
            RH_Err.ctl(
                400,
                msgx='It is not allowed to create object '
                     'with name starting with "_"',
                logLevel=logging.INFO,
            )

        # not allowed name
        if self.callerArgs.id in self.NOT_ALLOWED_NAME:
            RH_Err.ctl(
                400,
                msgx='It is not allowed to create object with name "%s"'
                     '' % self.callerArgs.id,
                logLevel=logging.INFO,
            )


class BaseModel(object):
    """Model of Data.
    It ensure that key/value stored in *.conf are mapped to storage key/value,
    key/value shown to user are mapped to interface key/value.
    """
    # REST prefix. Default is lower-case app name.
    # Change it if needed.
    rest_prefix = APP_NAME

    # Endpoint, specifies the conf name, in form:
    # configs/conf-<conf_file_name>
    endpoint = ''

    # Argument names:
    # arguments are required (interface keys, which are shown to user).
    requiredArgs = set()
    # arguments are optional (interface keys, which are shown to user).
    optionalArgs = set()
    # arguments will be ignored ,not saved
    # (interface keys, which are shown to user).
    transientArgs = set()
    # arguments need to be encrypted
    # (storing keys, which are the ones after key mapping).
    encryptedArgs = set()
    allowExtra = False  # is extra parameters to persist allowed.

    defaultVals = {}    # default values for some fields.
    validators = {}     # validators specified for fields
    normalisers = {}    # normalisers specified for fields
    keyMap = {}     # arguments' name mapping: interface key ==> storage key
    valMap = {}     # arguments' value mapping

    # Extra fields in return data (metadata fields).
    outputExtraFields = ('eai:acl', 'acl', 'eai:attributes',
                         'eai:appName', 'eai:userName',
                         'disabled')

    # Required capabilities for this REST Endpoint.
    # Empty string means no need to check capability.
    # It will add ``rest_prefix`` automatically.
    #   cap4endpoint: basic capability for this endpoint.
    #   cap4get_cred: capability to get credential info.
    cap4endpoint = ''
    cap4get_cred = ''

    def validate(self, args):
        """Validate request arguments.
        """
        for k, vs in args.items():
            if k not in self.validators or not vs:
                continue
            if not isinstance(vs, list):
                vs = [vs]
            for v in vs:
                if not self.validators[k].validate(v, args):
                    RH_Err.ctl(1100,
                               msgx=('{msg} - field={k}'
                                     .format(msg=self.validators[k].msg,
                                             k=k)),
                               logLevel=logging.INFO)
        return args

    def normalize(self, data):
        """Normalize request arguments or response data.
        """
        for k, vs in data.items():
            if k not in self.normalisers or not vs:
                continue
            if isinstance(vs, list) or \
                    isinstance(vs, dict) or \
                    isinstance(vs, tuple):
                data[k] = [self.normalisers[k].normalize(v)
                           if isinstance(v, basestring)
                           else v for v in vs]
            else:
                data[k] = self.normalisers[k].normalize(vs)
        return data


def ResourceHandler(model, handler=BaseRestHandler):
    return type(handler.__name__, (handler, model), {})
