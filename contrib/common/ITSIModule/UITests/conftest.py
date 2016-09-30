"""
Selenium specific test configuration for ITSI module UI functional tests.

To check the options available, from this dir run:
  - B{py.test -h}

Author Eric Cheng
"""
import os
import logging
import ConfigParser
import pytest
from xml.dom import minidom
from ITSIModule.lib import StanzaUtil
from ITSIModule.lib.SplunkConn import SplunkConn
from ITSIModule.lib.SSLUtil import SSLUtil
"""from web.UISession import *"""
pytest_plugins     = ['pytest_webdriver']
LOGGER             = logging.getLogger("UI-Conftest")
MODULE_VIZ_CONF    = "itsi_module_viz"
SERVICE_TEMPLATE   = "itsi_service_template"
DRILLDOWN_PARSER   = ConfigParser.SafeConfigParser(allow_no_value=True)
DRILLDOWN_CONF     = "deep_dive_drilldowns.conf"
module_local_dir   = ""
module_default_dir = ""
SPLUNK_HOME        = ""


def pytest_addoption(parser):

    parser.addoption('--username', dest='username',
                     help='Username',
                     default='admin')

    parser.addoption('--password', dest='password',
                     help='Password',
                     default='changeme')

    parser.addoption('--splunk-home', dest='splunk_home',
                     help='The location of the Splunk instance',
                     default="/Applications/Splunk")
    parser.addoption('--module', dest='module_name',
                     help='Module Name',
                     default='DA-ITSI-OS')
    parser.addoption('--URL', dest='url',
                     help='URL of extendable tabs',
                     default='')


def pytest_configure(config):
    '''
    Handles pytest configuration, runs before the session start.
    '''
    LOGGER.info("Configuring splunk_home.")
    username    = config.getvalue('username')
    password    = config.getvalue('password')
    module      = config.getvalue('module_name')
    splunk_home = config.getvalue("splunk_home")
    config.__setattr__('username', config.getvalue('username'))
    config.__setattr__('password', config.getvalue('password'))
    config.__setattr__('module', config.getvalue('module_name'))
    config.__setattr__('url', config.getvalue('url'))
    config.__setattr__('SPLUNK_HOME', config.getvalue("splunk_home"))
    os.environ["SPLUNK_HOME"] = splunk_home
    ssl_utl = SSLUtil()
    ssl_utl.disable_ssl()
    splunk_conn = SplunkConn(module, enable_ssl=False, username=username, password=password) 


def params(funcarglist):
    '''
    Method used with generated/parameterized tests, can be used to decorate
    your test function with the parameters.  Each dict in your list
    represents one generated test.  The keys in that dict are the parameters
    to be used for that generated test
    '''
    def wrapper(function):
        '''
        Wrapper function to add the funcarglist to the function
        '''
        function.funcarglist = funcarglist
        return function
    return wrapper


def pytest_generate_tests(metafunc):
    '''
    Method used to generate parametrized tests. It requires a list obj to 
    be passed in. The name defined in metafunc.parametrize is the parameter 
    to be used for the generated test
    '''
    if 'tab' in metafunc.fixturenames:
        tabs = get_info_from_conf("tabs")
        metafunc.parametrize("tab", tabs)
    if 'panel' in metafunc.fixturenames:
        panels = get_info_from_conf("panels")
        metafunc.parametrize("panel", panels)


def get_info_from_conf(infoName):
    '''
    Method used to get information out of conf file
    Current list of available information and mapping of the conf file
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |        infoName       |           conf file       | return type               |  description                              |
    +=======================+===========================+============================+==========================================+
    |  tabs                 | itsi_module_viz.conf      | dictionary                | list of strings to store tab names        |
    |                       |                           | key: tab                  | parsed from conf file                     |
    |                       |                           | val: list of drilldown    |                                           |
    |                       |                           |       page title          |                                           |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |  panels               | itsi_module_viz.conf      | list of dictionary        | dictionary obj that stores panels title   |
    |                       |                           | key: tab name             | under a specific tab                      |
    |                       |                           | val: list of panel names  |                                           |
    |                       |                           |      and panel file names |                                           |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |  activation_rule      | itsi_module_viz.conf      | dictionary                | dictionary obj that maps kpi title to tab |
    |                       |                           | key: kpi title            | name based on activation rule defined in  |
    |                       |                           | val: tab name             | conf file                                 |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |  service_name         | itsi_da.conf              | string                    | service name appeared in create service   |
    |                       |                           |                           | dialog                                    |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |  drill_down_opt_dict  | deep_dive_drilldowns.conf | dictionary                | dictionary to map drill down option label |
    |                       | module view .xml file     | key: drilldown option     | to actual drill down page title           |
    |                       |                           | val: drilldown page title |                                           |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    |  control_token        | itsi_module_viz.conf      | dictionary                | dictionary obj that maps tab name to its  |
    |                       |                           | key: tab name             | control_token value defined in conf file  |
    |                       |                           | val: control_token value  |                                           |
    +-----------------------+---------------------------+---------------------------+-------------------------------------------+
    '''
    config = pytest.config
    stanza_util = StanzaUtil(config.module, config.username, config.password)
    if infoName in ["tabs", "panels", "activation_rule", "control_token"]:
        tab_stanza_name_lst = []
        for stanza in stanza_util.get_stanza_list(MODULE_VIZ_CONF):
            if stanza.startswith("views:"):
                tab_stanza_name_lst += stanza_util.get_value_by_key(
                    MODULE_VIZ_CONF, stanza, "list").split(",")
        if infoName == "tabs":
            return get_tabs_name_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util)
        elif infoName == "panels":
            return get_panels_under_tab_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util)
        elif infoName == "activation_rule":
            return get_activation_rule_under_tab_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util)
        else:
            return get_control_token_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util)
    elif infoName == "service_name":
        return get_service_name_from_itsi_service_template(stanza_util)
    elif infoName == "drill_down_opt_dict":
        return get_drill_down_opt_dict()
    else:
        return None


def get_tabs_name_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util):
    '''
    Method used to parse conf file to get tab name from "title" key under stanza
    '''
    tab_name_dict = {}
    for tab_stanza_name in tab_stanza_name_lst:
        tab_title = stanza_util.get_value_by_key(MODULE_VIZ_CONF, tab_stanza_name, "title")
        drill_down_file = tab_stanza_name.split(":")[1]+".xml"
        drill_down_page_title = get_drilldown_page_title(drill_down_file)
        if "default" not in tab_name_dict:
            tab_name_dict["default"] = tab_title
        if tab_title in tab_name_dict:
            tab_name_dict[tab_title].append(drill_down_page_title)
        else:
            tab_name_dict[tab_title] = [drill_down_page_title]
    return tab_name_dict


def get_panels_under_tab_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util):
    '''
    Method used to get tab-panels mapping. It gets panel file name from 
    itsi_module_viz.conf file and then parses panel xml file to get title
    '''
    tab_panel_map_lst = []
    
    for tab_stanza_name in tab_stanza_name_lst:
        panels_lst = []
        panel_file_lst = []
        tab_panel_map = {}
        value_lst = []
        drill_down_file = tab_stanza_name.split(":")[1]+".xml"
        drill_down_page_title = get_drilldown_page_title(drill_down_file)
        content_under_tab = stanza_util.get_content_under_stanza(
            MODULE_VIZ_CONF, tab_stanza_name)
        keys = content_under_tab.keys()
        keys.sort()
        for key in keys:
            if key.startswith("row"):
                for panel in content_under_tab[key].split(","):
                    panel_file_name = panel.split(":")[1]
                    panels_lst.append(_get_panel_title(panel_file_name))
                    panel_file_lst.append(panel_file_name)
        value_lst.append(panels_lst)
        value_lst.append(panel_file_lst)
        value_lst.append(drill_down_page_title)
        tab_panel_map[content_under_tab["title"]] = value_lst
        tab_panel_map_lst.append(tab_panel_map)
    return tab_panel_map_lst


def get_activation_rule_under_tab_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util):
    '''
    Method used to get activation rule. It reads kpis from itsi_module_viz.conf 
    file then maps it to kpi title from itsi_kpi_template.conf
    '''
    kpis_map_to_tab = {}
    KEY_NAME = "activation_rule"
    for tab_stanza_name in tab_stanza_name_lst:
        if stanza_util.contains_key(MODULE_VIZ_CONF, tab_stanza_name, KEY_NAME):
            kpis_lst = stanza_util.get_value_by_key(MODULE_VIZ_CONF, tab_stanza_name, KEY_NAME).split(",")
            for kpi in kpis_lst:
                kpi_title = _get_kpi_title_from_itsi_kpi_template_conf(kpi.strip(), stanza_util)
                kpis_map_to_tab[kpi_title] = stanza_util.get_value_by_key(MODULE_VIZ_CONF, tab_stanza_name, "title")
    return kpis_map_to_tab


def get_control_token_from_itsi_module_viz_conf(tab_stanza_name_lst, stanza_util):
    '''
    Method used to get control_token for each tab
    '''
    tab_map_to_token = {}
    for tab_stanza_name in tab_stanza_name_lst:
        tab_title = stanza_util.get_value_by_key(MODULE_VIZ_CONF, tab_stanza_name, "title")
        drill_down_file = tab_stanza_name.split(":")[1]+".xml"
        drill_down_page_title = get_drilldown_page_title(drill_down_file)
        control_token = stanza_util.get_value_by_key(MODULE_VIZ_CONF, tab_stanza_name, "control_token")
        key = "_".join((tab_title, drill_down_page_title))
        tab_map_to_token[key] = control_token
    return tab_map_to_token


def get_service_name_from_itsi_service_template(stanza_util):
    '''
    Method used to get service name
    '''
    for stanza in stanza_util.get_stanza_list(SERVICE_TEMPLATE):
        service_name = stanza_util.get_value_by_key(SERVICE_TEMPLATE, stanza, "title")
        if service_name:            
            return service_name.strip()
    return None


def get_drill_down_opt_dict():
    '''
    Method used to get drill_down_opt_name list
    '''
    drill_down_opt_dict = {}
    read_conf_file(DRILLDOWN_CONF, DRILLDOWN_PARSER)
    drill_down_page_title_lst = get_drilldown_page_title()
    drill_down_opt_lst = DRILLDOWN_PARSER.sections()
    if len(drill_down_page_title_lst) == len(drill_down_opt_lst):
        drill_down_page_title_lst.sort()
        drill_down_opt_lst.sort()
        drill_down_opt_dict = dict(zip(drill_down_opt_lst, drill_down_page_title_lst))
    return drill_down_opt_dict


def get_drilldown_page_title(file_name=None):
    '''
    Method to get drill down page title, which is used by Selenium to swtich tabs
    '''
    config = pytest.config
    base_dir = os.path.join(
        config.SPLUNK_HOME, "etc/apps/%s/default/data/ui/views" % config.module)
    if file_name:
        file_path = os.path.join(base_dir, file_name)
        return _get_node_from_xml(file_path, "label")
    else:
        xml_path_lst = _get_files_from_folder(base_dir, "xml")
        page_title_lst = []
        for xml_path in xml_path_lst:
            page_title_lst.append(_get_node_from_xml(xml_path, "label"))
        return page_title_lst


def read_conf_file(fileName, parser):
    '''
    Workaround for parsing deep_dive_drilldowns.conf since rest call does not 
    restrict results based on app name
    '''
    config = pytest.config
    module_local_dir = os.path.join(
        config.SPLUNK_HOME, "etc/apps/%s" % config.module, "local", fileName)
    module_default_dir = os.path.join(
        config.SPLUNK_HOME, "etc/apps/%s" % config.module, "default", fileName)
    if os.path.isfile(module_local_dir):
        parser.read(module_local_dir)
    else:
        parser.read(module_default_dir)


def _get_panel_title(panel_file_name):
    '''
    Method used to parse panel xml file to get panel title
    '''
    config = pytest.config
    doc = minidom.parse(
        os.path.join(config.SPLUNK_HOME, "etc/apps/%s/default/data/ui/panels/%s.xml" % (config.module, panel_file_name)))
    return "" if "events" in panel_file_name else doc.getElementsByTagName("title")[0].firstChild.nodeValue


def _get_kpi_title_from_itsi_kpi_template_conf(kpi_owner_field, stanza_util):
    '''
    Method to map kpi ownder field to kpi title
    '''
    kpi_obj_lst = stanza_util.get_kpi_list()
    for kpi_obj in kpi_obj_lst:
        if kpi_owner_field == kpi_obj.datamodel.owner_field:
            return kpi_obj.kpi_title
    return None


def _get_files_from_folder(dir, ext):
    '''
    Helper method to find all files with 
    specified extension under a dir
    '''
    for file in os.listdir(dir):
        if file.endswith(".%s" % ext):
            yield os.path.join(dir, file)


def _get_node_from_xml(file_path, node):
    '''
    Helper method to get a specified node
    value from a xml file
    '''
    doc = minidom.parse(file_path)
    return doc.getElementsByTagName(node)[0].firstChild.nodeValue




