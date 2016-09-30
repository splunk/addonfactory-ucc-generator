import splunktalib.common.xml_dom_parser as xdp
from splunktalib.conf_manager.request import _content_request

INPUT_ENDPOINT = "%s/servicesNS/%s/%s/data/inputs/%s"


def _input_endpoint_ns(uri, owner, app, input_type):
    return INPUT_ENDPOINT % (uri, owner, app, input_type)


def reload_data_input(splunkd_uri, session_key, owner, app_name,
                         input_type):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :return: True on success
    """
    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    uri += '/_reload'
    msg = "Failed to reload data input in app=%s: %s" % (app_name, input_type)
    content = _content_request(uri, session_key, "GET", None, msg)
    if content is None:
        return False
    return True


def create_data_input(splunkd_uri, session_key, owner, app_name, input_type,
                         name, key_values=None):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :param name: The name of the input stanza to create.
                 i.e. stanza [<input_type>://<name>] will be created.
    :param key_values: a K-V dict of details in the data input stanza.
    :return: True on success
    """
    if not key_values:
        key_values = {}
    key_values['name'] = name

    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    msg = "Failed to create data input in app=%s: %s://%s" % (
        app_name, input_type, name)
    content = _content_request(uri, session_key, "POST", key_values, msg)
    if content is None:
        return False
    return True


def get_data_input(splunkd_uri, session_key, owner, app_name, input_type,
                      name=None):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :param name: The name of the input stanza to create.
                 i.e. stanza [<input_type>://<name>] will be deleted.
    :return: the key-value dict of the data input, or a list of stanzas in
             the input type, including metadata
    """
    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    if name:
        uri += '/' + name.replace('/', '%2F')
    msg = "Failed to get data input in app=%s: %s://%s" % (
        app_name, input_type, name)
    content = _content_request(uri, session_key, "GET", None, msg)
    if content is not None:
        result = xdp.parse_conf_xml_dom(content)
        if name:
            result = result[0]
        return result
    return None


def update_data_input(splunkd_uri, session_key, owner, app_name, input_type,
                         name, key_values):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :param name: The name of the input stanza to create.
                 i.e. stanza [<input_type>://<name>] will be updated.
    :param key_values: a K-V dict of details in the data input stanza.
    :return: True on success
    """

    if 'name' in key_values:
        del key_values['name']
    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    uri += '/' + name.replace('/', '%2F')
    msg = "Failed to update data input in app=%s: %s://%s" % (
        app_name, input_type, name)
    content = _content_request(uri, session_key, "POST", key_values, msg)
    if content is None:
        return False
    return True


def delete_data_input(splunkd_uri, session_key, owner, app_name, input_type,
                         name):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :param name: The name of the input stanza to create.
                 i.e. stanza [<input_type>://<name>] will be deleted.
    :return: True on success
    """
    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    uri += '/' + name.replace('/', '%2F')
    msg = "Failed to delete data input in app=%s: %s://%s" % (
        app_name, input_type, name)
    content = _content_request(uri, session_key, "DELETE", None, msg)
    if content is None:
        return False
    return True


def operate_data_input(splunkd_uri, session_key, owner, app_name,
                          input_type, name, operation):
    """
    :param splunkd_uri: splunkd uri, e.g. https://127.0.0.1:8089
    :param session_key: splunkd session key
    :param owner: the owner (ACL user), e.g. '-', 'nobody'
    :param app_name: the app's name, e.g. 'Splunk_TA_aws'
    :param input_type: name of the input type.
                       if it is a script input, the input is 'script',
                       for modinput, say snow, the input is 'snow'
    :param name: The name of the input stanza to create.
                 i.e. stanza [<input_type>://<name>] will be operated.
    :param operation: must be "disable" or "enable"
    :return: True on success
    """
    if operation not in ("disable", "enable"):
        raise Exception('operation must be "disable" or "enable"')
    uri = _input_endpoint_ns(splunkd_uri, owner, app_name, input_type)
    uri += '/%s/%s' % (name.replace('/', '%2F'), operation)
    msg = "Failed to %s data input in app=%s: %s://%s" % (
        operation, app_name, input_type, name)
    content = _content_request(uri, session_key, "POST", None, msg)
    if content is None:
        return False
    return True
