
import logging

from splunk import admin

from ..common import log
from ..common import util

__all__ = ['getBaseAppName', 'logger', 'makeConfItem']


def getBaseAppName():
    """Base App name, which this script belongs to.
    """
    return 'Splunk_TA_aws'


try:
    logger = log.Logs().get_logger("util", level=logging.INFO)
except Exception as exc:
    print "FATAL ERROR: Fail to Get Logger - %s" % exc
    raise


def makeConfItem(name, entity, confInfo, user='nobody', app='-'):
    confItem = confInfo[name]
    for key, val in entity.items():
        if key not in ("eai:attributes", "eai:userName", "eai:appName"):
            confItem[key] = val
    confInfo[name]["eai:userName"] = entity["eai:userName"] if entity.get("eai:userName") else user
    confInfo[name]["eai:appName"] = entity["eai:appName"] if entity.get("eai:appName") else app
    confItem.setMetadata(admin.EAI_ENTRY_ACL, entity[admin.EAI_ENTRY_ACL] if entity.get(admin.EAI_ENTRY_ACL) else {'owner': user, 'app':app})
    return confItem
