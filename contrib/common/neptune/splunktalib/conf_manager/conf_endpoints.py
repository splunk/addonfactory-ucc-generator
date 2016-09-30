import splunktalib.common.xml_dom_parser as xdp
from splunktalib.conf_manager.request import content_request

CONF_ENDPOINT = "%s/servicesNS/%s/%s/configs/conf-%s"


def _format_stanza_name(name):
    replaces = {
        "/": "%2F",
        " ": "%20",
    }
    for key in replaces:
        name = name.replace(key, replaces[key])
    return name


def _conf_endpoint_ns(uri, owner, app, conf_name):
    return CONF_ENDPOINT % (uri, owner, app, conf_name)


def reload_conf(splunkd_uri, session_key, app_name, conf_name, throw=False):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param conf_names: a list of the name of the conf file, e.g. ["props"]
    :param app_name: the app"s name, e.g. "Splunk_TA_aws"
    """

    uri = _conf_endpoint_ns(splunkd_uri, "nobody", app_name, conf_name)
    uri += "/_reload"
    msg = "Failed to reload conf in app=%s: %s" % (app_name, conf_name)

    try:
        content_request(uri, session_key, "GET", None, msg)
    except Exception:
        if throw:
            raise


def create_stanza(splunkd_uri, session_key, owner, app_name, conf_name,
                  stanza, key_values):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. "-", "nobody"
    :param app_name: the app"s name, e.g. "Splunk_TA_aws"
    :param conf_name: the name of the conf file, e.g. "props"
    :param stanza: stanza name, e.g. "aws:cloudtrail"
    :param key_values: the key-value dict of the stanza
    :return: None on success otherwise throw exception
    """

    uri = _conf_endpoint_ns(splunkd_uri, owner, app_name, conf_name)
    msg = "Failed to create stanza=%s in conf=%s" % (stanza, conf_name)
    payload = {"name": stanza}
    for key in key_values:
        if key != "name":
            payload[key] = str(key_values[key])

    content_request(uri, session_key, "POST", payload, msg)


def get_conf(splunkd_uri, session_key, owner, app_name, conf_name,
             stanza=None):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. "-", "nobody"
    :param app_name: the app"s name, e.g. "Splunk_TA_aws"
    :param conf_name: the name of the conf file, e.g. "props"
    :param stanza: stanza name, e.g. "aws:cloudtrail"
    :return: a list of stanzas in the conf file, including metadata
    """

    uri = _conf_endpoint_ns(splunkd_uri, owner, app_name, conf_name)

    if stanza:
        uri += "/" + _format_stanza_name(stanza)

    msg = "Failed to get conf={0}, stanza={1}".format(conf_name, stanza)
    content = content_request(uri, session_key, "GET", None, msg)
    if not content:
        raise Exception(msg)

    return xdp.parse_conf_xml_dom(content)


def update_stanza(splunkd_uri, session_key, owner, app_name, conf_name,
                  stanza, key_values):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. "-", "nobody"
    :param app_name: the app"s name, e.g. "Splunk_TA_aws"
    :param conf_name: the name of the conf file, e.g. "props"
    :param stanza: stanza name, e.g. "aws:cloudtrail"
    :param key_values: the key-value dict of the stanza
    :return: None on success otherwise raise exception
    """

    uri = _conf_endpoint_ns(splunkd_uri, owner, app_name, conf_name)
    uri += "/" + _format_stanza_name(stanza)
    msg = "Failed to update stanza=%s in conf=%s" % (stanza, conf_name)
    return content_request(uri, session_key, "POST", key_values, msg)


def delete_stanza(splunkd_uri, session_key, owner, app_name, conf_name,
                  stanza, throw=False):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. "-", "nobody"
    :param app_name: the app"s name, e.g. "Splunk_TA_aws"
    :param conf_name: the name of the conf file, e.g. "props"
    :param stanza: stanza name, e.g. "aws:cloudtrail"
    :return: None on success otherwise raise exception
    """

    uri = _conf_endpoint_ns(splunkd_uri, owner, app_name, conf_name)
    uri += "/" + _format_stanza_name(stanza)
    msg = "Failed to delete stanza=%s in conf=%s" % (stanza, conf_name)
    content_request(uri, session_key, "DELETE", None, msg)


def stanza_exist(splunkd_uri, session_key, owner, app_name, conf_name,
                 stanza):
    try:
        res = get_conf(splunkd_uri, session_key, owner, app_name, conf_name,
                       stanza)
        return len(res) > 0
    except Exception:
        return False
