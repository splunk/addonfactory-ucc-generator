
from __future__ import absolute_import

import logging
import json

from splunk import admin

from splunktalib.rest import splunkd_request
from splunktaucclib.rest_handler.error_ctl import RestHandlerError as RH_Err

try:
    from splunktalib.common import util
except:
    print 'Python Lib for Splunk add-on "splunktalib" is required'
    raise BaseException()


__all__ = ['get_base_app_name', 'make_conf_item', 'user_caps']


def get_base_app_name():
    """Base App name, which this script belongs to.
    """
    app_name = util.get_appname_from_path(__file__)
    if app_name is None:
        raise Exception('Cannot get app name from file: %s' % __file__)
    return app_name


def make_conf_item(conf_item, entity, user='nobody', app='-'):
    for key, val in entity.iteritems():
        if key not in ("eai:attributes", "eai:userName", "eai:appName"):
            conf_item[key] = val
    conf_item["eai:userName"] = entity.get("eai:userName") or user
    conf_item["eai:appName"] = entity.get("eai:appName") or app
    default_metadata = {
        'owner': user,
        'app': app,
        'global': 1,
        'can_write': 1,
        'modifiable': 1,
        'removable': 1,
        'sharing': 'global',
        'perms': {'read': ['*'], 'write': ['admin']},
    }
    conf_item.setMetadata(
        admin.EAI_ENTRY_ACL,
        entity.get(admin.EAI_ENTRY_ACL) or default_metadata,
    )
    return conf_item


def user_caps(mgmt_uri, session_key):
    """
    Get capabilities of sessioned Splunk user.
    :param mgmt_uri:
    :param session_key:
    :return:
    """
    url = mgmt_uri + '/services/authentication/current-context'

    resp, cont = splunkd_request(
        url,
        session_key,
        method='GET',
        data={'output_mode': 'json'},
        retry=3,
    )
    if resp is None:
        RH_Err.ctl(
            500,
            logLevel=logging.ERROR,
            msgx='Fail to get capabilities of sessioned user',
        )
    elif resp.status not in (200, '200'):
        RH_Err.ctl(
            resp.status,
            logging.ERROR,
            cont,
        )

    cont = json.loads(cont)
    caps = cont['entry'][0]['content']['capabilities']
    return set(caps)
