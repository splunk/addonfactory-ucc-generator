
from __future__ import absolute_import

from functools import wraps
from splunk import admin
from solnlib.splunkenv import get_splunkd_uri

from .eai import EAI_FIELDS
from . import RestHandler


def make_conf_item(conf_item, content, eai):
    for key, val in content.iteritems():
        conf_item[key] = val

    for eai_field in EAI_FIELDS:
        conf_item.setMetadata(eai_field, eai.content[eai_field])

    return conf_item


def build_conf_info(meth):
    @wraps(meth)
    def wrapper(self, confInfo):
        result = meth(self, confInfo)
        for entity in result:
            make_conf_item(
                confInfo[entity.name],
                entity.data,
                entity.eai,
            )
    return wrapper


class AdminExternalHandler(admin.MConfigHandler):

    def __init__(self, scriptMode, ctxInfo, request=None):
        admin.MConfigHandler.__init__(
            self,
            scriptMode,
            ctxInfo,
            request,
        )
        self.handler = RestHandler(
            get_splunkd_uri(),
            self.getSessionKey(),
            self.model,
        )

    def setup(self):
        return

    @build_conf_info
    def handleList(self, confInfo):
        if self.callerArgs.id:
            result = self.handler.get(self.callerArgs.id)
        else:
            sort_dir = self.sortAscending and 'asc' or 'desc'
            query = {
                'count': self.maxCount,
                'sort_key': self.sortByKey,
                'sort_dir': sort_dir,
                'offset': self.posOffset,
            }
            result = self.handler.all(**query)
        return result

    @build_conf_info
    def handleCreate(self, confInfo):
        return self.handler.create(
            self.callerArgs.id,
            self.callerArgs.data,
        )

    @build_conf_info
    def handleEdit(self, confInfo):
        return self.handler.update(
            self.callerArgs.id,
            self.callerArgs.data,
        )

    @build_conf_info
    def handleRemove(self, confInfo):
        return self.handler.delete(self.callerArgs.id)


def handle(
        model,
        handler=AdminExternalHandler,
        context_info=admin.CONTEXT_APP_ONLY,
):
    real_handler = type(
        handler.__name__,
        (handler, ),
        {'model': model},
    )
    admin.init(real_handler, ctxInfo=context_info)
