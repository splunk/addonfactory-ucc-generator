# encoding=utf-8
import re
import os
import sys
import json
import time
import threading
import traceback

from aob.aob_common import builder_constant
from builder_exception import CommonException
import solnlib.conf_manager
import solnlib.splunk_rest_client
import solnlib.utils
import solnlib.splunkenv
from solnlib.packages.splunklib.binding import HTTPError

from aob.aob_common import logger, conf_parser
from aob.aob_common.metric_collector import metric_util

_logger = logger.get_builder_util_logger()

RESERVED_NAME_CHARS = re.compile("[<>\:\"\/\\\|\?\*]")

AUTHORITY_PATTERN = re.compile(
    "^((?P<scheme>[\w]+)\:\/\/)?(?P<host>[\w\.\-_]+)(\:(?P<port>[\d]+))?$")


from aob.aob_common.metric_collector import monitor
m = monitor.Monitor()
import time

def contain_reserved_chars(path_str):
    return RESERVED_NAME_CHARS.search(path_str) is not None


def parse_url(uri):
    if (uri is None) or (not isinstance(uri, str)):
        return (None, None, None)
    m = AUTHORITY_PATTERN.match(uri)
    if m:
        groups = m.groupdict()
        port = int(groups['port']) if groups['port'] else None
        return (groups['scheme'], groups['host'], port)
    else:
        return (None, None, None)


def parse_splunkd_uri(uri):
    scheme, host, port = parse_url(uri)
    if scheme is None and host is None and port is None:
        return (None, None, None)
    if scheme is None:
        scheme = 'https'
    if host is None:
        host = 'localhost'
    if port is None:
        port = 8089
    return (scheme, host, port)


def rename_search_time_field(field_name):
    field_name = field_name.strip()
    reserved_fields = ("source", "sourcetype", "host", "index", "linecount",
                       "timestamp")
    field_name = re.sub(r"\W", "_", field_name).strip("_ ")
    matches = re.findall(r"([a-zA-Z]\w*)\W*$", field_name)
    if matches:
        field_name = matches[0]

    if field_name in reserved_fields:
        field_name = "extracted_{}".format(field_name)

    return field_name


def get_tab_version_and_build(service):
    all_apps = service.apps

    builder = filter(
        lambda a: a.name == builder_constant.ADDON_BUILDER_APP_NAME, all_apps)
    if len(builder) == 1:
        builder = builder[0]
        return (builder.content['version'], builder.content['build'])
    raise Exception("app {0} not found.".format(
        builder_constant.ADDON_BUILDER_APP_NAME))

# global container, which is used for the cache
# make splunk home path is too heavy
g_splunk_path_cache = {}
splunk_path_lock = threading.Lock()

@metric_util.function_run_time(tags=['tab_common_util'])
def make_splunk_path(parts):
    k = '/'.join(parts)
    with splunk_path_lock:
        if k in g_splunk_path_cache:
            return g_splunk_path_cache[k]
        else:
            p = solnlib.splunkenv.make_splunkhome_path(parts)
            g_splunk_path_cache[k] = p
            return p

g_root_endpoint = None
@metric_util.function_run_time(tags=['tab_common_util'])
def get_root_endpoint(session_key, splunkd_uri):
    global g_root_endpoint
    try:
        if g_root_endpoint is None:
            mgr = create_conf_mgr(session_key, splunkd_uri)
            web_conf = mgr.get_conf('web')
            g_root_endpoint = web_conf.get('settings').get('root_endpoint')
    except solnlib.conf_manager.ConfStanzaNotExistException:
        return None
    return g_root_endpoint

@metric_util.function_run_time(tags=['tab_common_util'])
def create_conf_mgr(session_key,
                    splunkd_uri,
                    app=builder_constant.ADDON_BUILDER_APP_NAME,
                    owner='nobody',
                    max_pool_len=1):
    scheme, host, port = solnlib.utils.extract_http_scheme_host_port(
        splunkd_uri)
    m = solnlib.conf_manager.ConfManager(
        session_key,
        app,
        scheme=scheme,
        host=host,
        port=port,
        owner=owner,
        context={'pool_connections': 1,
                 'pool_maxsize': 5})
    return m

@metric_util.function_run_time(tags=['tab_common_util'])
def delete_app(service, app_id):
    '''
    delete the app with splunkd rest api
    :param service: a splunklib service object.
    :type service: ``object``
    :param app_id: the app id to be deleted
    :type app_id: ``string``
    :returns: None. If fails, exception is thrown
    :rtype: ``None``
    '''
    endpoint_path = '/services/apps/local/{}'.format(app_id)
    try:
        response = service.delete(endpoint_path)

        if response['status'] not in (200, 404):
            _logger.error('fail to delete splunk app %s. status is %s.',
                          app_id, response['status'])
            raise CommonException(
                e_message='fail to delete splunk app {}'.format(app_id),
                err_code=48,
                options={'app': app_id, 'http_code': response['status']})
    except HTTPError as he:
        if he.status != 404:
            _logger.warning('fail to delete splunk app %s via API. %s', app_id,
                          traceback.format_exc())
            # TAB-2693: in windows, when the data input is running, this API will return an error:
            #     HTTPError: HTTP 500 Internal Server Error --
            #     In handler 'localapps': Cannot remove application: Cannot remove application directory: C:\Program Files\Splunk\etc\apps\xxx: There are no more files.
            # Actually the dir has been removed except the bin dir without any files.
            # So we have to skip this error and remove entire app dir later.

            # raise CommonException(
            #     e_message='fail to delete splunk app {}'.format(app_id),
            #     err_code=49,
            #     options={'app': app_id})



@metric_util.function_run_time(tags=['tab_common_util'])
def reload_splunk_apps(service):
    '''
    reload the splunk apps with the services/apps/local/_reload endpoint
    :param service: a splunklib service object. You can use create_splunk_service to create one
    :type service: ``object``
    :returns: None. If fails, exception is thrown
    :rtype: ``None``
    '''
    try:
        response = service.apps.get('_reload')
        if response['status'] != 200:
            _logger.error('Fail to reload the splunk apps. http response:%s',
                          response)
            raise CommonException(
                e_message='fail to reload the splunk apps.',
                err_code=39,
                options={'http_code': response['status']})
    except HTTPError as he:
        _logger.error('Fail to reload the splunk apps. %s',
                      traceback.format_exc())
        raise CommonException(
            e_message='fail to reload the splunk apps.',
            err_code=39,
            options={'http_code': he.status})


@metric_util.function_run_time(tags=['tab_common_util'])
def reload_local_app(service, app_name):
    '''
    reload the specific app with the endpoint: /servicesNS/nobody/system/apps/local/<app_name>/_reload
    This endpoint will reload all the data inputs
    :param service: splunklib service object
    :type service: ``object``
    :param app_name: the app needs to be reloaded
    :type app_name: ``string``
    '''
    endpoint_path = '/servicesNS/nobody/system/apps/local/{}/_reload'.format(
        app_name)
    try:
        response = service.get(endpoint_path)

        if response['status'] != 200:
            _logger.error('fail to reload splunk app %s. status is not 200.',
                          app_name)
            raise CommonException(
                e_message='fail to reload splunk app {}'.format(app_name),
                err_code=45,
                options={'app': app_name, 'http_code': response['status']})
    except HTTPError as he:
        _logger.error('fail to reload splunk app %s. %s', app_name,
                      traceback.format_exc())
        raise CommonException(
            e_message='fail to reload splunk app {}'.format(app_name),
            err_code=45,
            options={'app': app_name, 'http_code': response['status']})


@metric_util.function_run_time(tags=['tab_common_util'])
def create_splunk_service(session_key,
                          splunkd_uri,
                          app=builder_constant.ADDON_BUILDER_APP_NAME,
                          owner='nobody',
                          max_pool_len=1):
    scheme, host, port = solnlib.utils.extract_http_scheme_host_port(
        splunkd_uri)
    s = solnlib.splunk_rest_client.SplunkRestClient(
        session_key,
        app,
        owner=owner,
        scheme=scheme,
        host=host,
        port=port,
        context={'pool_connections': 1,
                 'pool_maxsize': 5})
    return s


def is_true(val):
    value = str(val).strip().upper()
    if value in ("1", "TRUE", "T", "Y", "YES"):
        return True
    return False


def is_false(val):
    if is_true(val):
        return False
    return True


def get_splunkd_uri(service):
    return '{}://{}:{}'.format(service.scheme, service.host, service.port)


space_replace = re.compile('[^\w]+')


@metric_util.function_run_time(tags=['tab_common_util'])
def get_python_lib_dir_name(app_name):
    return space_replace.sub('_', app_name.lower())


def get_python_declare_file_name(app_name):
    lib_dir_name = get_python_lib_dir_name(app_name)
    return '{}_declare.py'.format(lib_dir_name)


def get_or_create_conf_file(conf_mgr, file_name, refresh=False):
    try:
        conf = conf_mgr.get_conf(file_name, refresh)
        return conf
    except solnlib.conf_manager.ConfManagerException as cme:
        conf_mgr._confs.create(file_name)
        return conf_mgr.get_conf(file_name, refresh=True)


@metric_util.function_run_time(tags=['tab_common_util'])
def filter_eai_property(stanza):
    if isinstance(stanza, dict):
        for k in list(stanza.keys()):
            if k.startswith('eai:'):
                del stanza[k]
            else:
                stanza[k] = filter_eai_property(stanza[k])
    return stanza


def _get_profile_whitelist_and_blacklist_stanza(setting_path):
    try:
        parser = conf_parser.TABConfigParser()
        parser.read(setting_path)
        stanza = {item[0]: item[1] for item in parser.items('perf_profile')}
        white_list = stanza.get('profiler_white_list', None)
        if white_list:
            if white_list.lower() == 'null':
                white_list = []
            else:
                white_list = [t.strip() for t in white_list.split(',')]
        black_list = stanza.get('profiler_black_list', None)
        if black_list:
            if black_list.lower() == 'null':
                black_list = []
            else:
                black_list = [t.strip() for t in black_list.split(',')]
        return white_list, black_list
    except Exception as e:
        _logger.debug('Can not get whitelist and blacklist. %s', e)
        return None, None


def initialize_apm():
    default_settings = solnlib.splunkenv.make_splunkhome_path([
        'etc', 'apps', builder_constant.ADDON_BUILDER_APP_NAME, 'default',
        'settings.conf'
    ])
    default_whitelist, default_blacklist = _get_profile_whitelist_and_blacklist_stanza(
        default_settings)

    local_settings = solnlib.splunkenv.make_splunkhome_path([
        'etc', 'apps', builder_constant.ADDON_BUILDER_APP_NAME, 'local',
        'settings.conf'
    ])
    local_whitelist, local_blacklist = _get_profile_whitelist_and_blacklist_stanza(
        local_settings)
    white_list = local_whitelist if local_whitelist is not None else default_whitelist
    black_list = local_blacklist if local_blacklist is not None else default_blacklist

    _logger.debug('Init apm logger with black_list:%s, white_list:%s',
                  black_list, white_list)
    metric_util.initialize_metric_collector({
        'app': builder_constant.ADDON_BUILDER_APP_NAME,
        'event_writer': 'file',
        'writer_config': {
            'tag_black_list': black_list,
            'tag_white_list': white_list
        }
    })


def validate_brackets_and_quotes(data, brackets=[('(', ')')]):
    blen = len(brackets)
    bcount = [0 for i in range(blen)]
    in_quote = False
    quote = None

    msg = "Brackets mismatched in the string '{}'.".format(data)
    bracket_except = CommonException(
        err_code=5015, e_message=msg, options={"data": data})
    for c in data:
        if c == '"' and not in_quote:
            in_quote = True
            quote = c
        elif c == "'" and not in_quote:
            in_quote = True
            quote = c
        elif in_quote and c == quote:
            in_quote = False
            quote = None

        if in_quote:
            continue

        for i in range(blen):
            start, end = brackets[i]
            if c == start:
                bcount[i] += 1
            elif c == end:
                bcount[i] -= 1
            if bcount[i] < 0:
                raise bracket_except

    if in_quote:
        msg = "Quotes mismatched in the string '{}'.".format(data)
        raise CommonException(
            err_code=5016, e_message=msg, options={"data": data})

    for count in bcount:
        if count != 0:
            raise bracket_except


def replace_quotes(data, quotes=('"', "'")):
    res = {"data": data, }

    if not data:
        return res

    i = 0
    quote_prefix = "aob_quotes"
    tokens = {}
    in_quote = False
    is_escaped = False
    quoted_chars = []
    curr_quote = None
    for ch in data:
        if ch == "\\":
            if is_escaped: # for "\\"
                is_escaped = False
            else: # for "\"
                is_escaped = True
            quoted_chars.append(ch)
        elif ch in quotes and not is_escaped: # it's an unescaped quote
            if in_quote: # end of quoted string
                if ch != curr_quote: # if it's an embedded quote
                    quoted_chars.append(ch)
                    continue
                quoted_chars.append(ch)
                quoted_text = ''.join(quoted_chars)
                tokens[i] = quoted_text
                data = data.replace(quoted_text, "{0}_{1}_{0}".format(quote_prefix, i))
                i += 1
                in_quote = False
            else: # start of quoted string
                in_quote = True
                curr_quote = ch
                quoted_chars = [ch,]
        else: # it's not a quote
            if is_escaped: # unescape when adding any other chars
                is_escaped = False
            quoted_chars.append(ch)

    if tokens:
        res = {
            "tokens": tokens,
            "data"  : data,
            "prefix": quote_prefix,
        }

    return res


def get_bracket_blocks(data):
    if not data or len(data) < 2:
        return None

    blocks = []
    start, end = 0, 0
    balance = 0
    i = 0
    for c in data:
        if c == "(":
            balance += 1
            if start == 0:
                start = i
        elif c == ")":
            balance -= 1
            if balance == 0:
                block = data[start + 1:i]
                if block:
                    blocks.append(block)

                # res += _get_bracket_blocks(block)
                start = 0
        i += 1

    tokens = {}
    bracket_prefix = "aob_brackets"
    i = 0
    for block in blocks:
        tokens[i] = block
        data = data.replace(block, "{0}_{1}_{0}".format(bracket_prefix, i))
        i += 1

    res = {
        "tokens": tokens,
        "data": data,
        "prefix": bracket_prefix,
    }
    return res


def restore_data(data, tokens, prefix):
    if not tokens or not prefix:
        return data

    for k, v in tokens.items():
        replacement = "{0}_{1}_{0}".format(prefix, k)
        data = data.replace(replacement,v)

    return data