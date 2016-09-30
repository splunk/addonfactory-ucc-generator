"""
Splunk TA ucc server program template.
"""

import os
import sys
import json
import errno
import traceback

import splunktalib.common.util as utils
import splunktalib.splunk_platform as ssp
import splunktalib.modinput as modinput
import splunktalib.orphan_process_monitor as sopm

from splunktaucclib.ucc_server import UCCServerException
import splunktaucclib.common.log as stulog
from splunktaucclib.ucc_server.ucc_server_core import UCCServer
from splunktaucclib.config import Config as UCCConfig, ConfigException
from splunktaucclib.ucc_server.ucc_server_config import UCCServerConfigLoader
from splunktaucclib.ucc_server.ucc_server_config import get_schema
import splunktalib.splunk_cluster as sc

stulog.reset_logger("ucc_server")

class ExitStatus(object):
    NOT_A_CAPTION = 1

def _get_modular_input_file():
    import __main__
    return __main__.__file__


def _get_local_conf_dir():
    return os.path.dirname(os.path.dirname(
        os.path.abspath(_get_modular_input_file()))) + os.path.sep + "local" + os.path.sep


def do_scheme(ucc_setting):
    """
    Feed splunkd the TA's scheme.
    """

    print """
    <scheme>
      <title>{title}</title>
      <description>{description}</description>
      <use_external_validation>false</use_external_validation>
      <streaming_mode>simple</streaming_mode>
      <use_single_instance>true</use_single_instance>
      <endpoint>
        <args>
          <arg name="name">
            <title>{title} Name.</title>
          </arg>
          <arg name="description">
            <title>{title} description.</title>
            <required_on_create>0</required_on_create>
            <required_on_create>0</required_on_create>
          </arg>
        </args>
      </endpoint>
    </scheme>
    """.format(title=ucc_setting["title"], description=ucc_setting["description"])


def _setup_signal(ucc_server, ucc_setting):
    """
    Setup signal handler.
    """

    def _sig_handler(signum, frame):
        stulog.logger.info("message=\"{title} will exit\" "
                           "detail_info=\"Interrupted by signal:{sig}\""
                           .format(title=ucc_setting["title"], sig=signum))
        ucc_server.stop()

    utils.handle_tear_down_signals(_sig_handler)


def _setup_orphan_process_monitor(ucc_server):
    def _orphan_process_handler():
        stulog.logger.info("orphan process")
        ucc_server.stop()

    sopm.OrphanProcessMonitor(_orphan_process_handler).start()


def run(ucc_setting):
    """
    Splunk TA Modualr Input entry.
    """
    # Clean http proxy environ
    utils.remove_http_proxy_env_vars()

    # Set log level
    stulog.set_log_level("INFO")

    # # debug mode
    # meta_configs, _ = create_debug_config()

    # comment it
    meta_configs, _ = modinput.get_modinput_configs_from_stdin()

    server_info = sc.ServerInfo(meta_configs["server_uri"],
                                meta_configs["session_key"])

    if server_info.is_shc_member() and not server_info.is_captain():
        # In SHC env, only captain is able to refresh all tokens
        stulog.logger.debug("message=\"{title} will exit\" "
                           "detail_info=\"This search header is not captain\""
                           .format(title=ucc_setting["title"]))
        return ExitStatus.NOT_A_CAPTION

    app_name = ssp.get_appname_from_path(
        os.path.abspath(_get_modular_input_file()))
    assert app_name, UCCServerException("app_name is None.")

    ucc_config = UCCConfig(splunkd_uri=meta_configs["server_uri"],
                           session_key=meta_configs["session_key"],
                           schema=json.dumps(ucc_setting["config"]),
                           user="nobody",
                           app=app_name)
    ucc_config_loader = UCCServerConfigLoader(
        ucc_config,
        id_locator=ucc_setting["meta.id"],
        logging_locator=ucc_setting["meta.logging"],
        local_forwarder_locator=ucc_setting["meta.local_forwarder"],
        forwarders_snapshot_locator=ucc_setting["meta.forwarder_snapshot"],
        dispatch_snapshot_locator=ucc_setting["meta.dispatch_snapshot"])

    ucc_server_id = ucc_config_loader.get_ucc_server_id(create_if_empty=False)
    if not ucc_server_id and not server_info.is_shc_member():
        ucc_config_loader.enable_local_forwarder()

    # force to get again
    ucc_server_id = ucc_config_loader.get_ucc_server_id(create_if_empty=True)
    ucc_server = UCCServer(
        meta_configs["server_uri"],
        meta_configs["session_key"],
        ucc_config_loader.load_ucc_server_input,
        [_get_local_conf_dir() + _file for _file in
         ucc_setting["monitor_file"]],
        ucc_setting["filter"],
        ucc_setting["division"],
        ucc_setting["dispatch"],
        ucc_config_loader.get_forwarders_snapshot,
        ucc_config_loader.update_forwarders_snapshot,
        ucc_config_loader.get_dispatch_snapshot,
        ucc_config_loader.update_dispatch_snapshot,
        ucc_server_id,
        get_log_level_callback=ucc_config_loader.get_ucc_server_log_level)
    # Setup signal handler
    _setup_signal(ucc_server, ucc_setting)
    # Setup orphan process monitor
    _setup_orphan_process_monitor(ucc_server)
    # Start ucc server
    ucc_server.start()


def main(schema_file_path):
    ucc_setting = get_schema(schema_file_path)
    title = ucc_setting["title"]

    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":
            do_scheme(ucc_setting)
        else:
            stulog.logger.critical("message=\"%s "
                                   "exit abnormally\" "
                                   "detail_info=\"Invalid argument: %s\"",
                                   title,
                                   sys.argv[1])
            sys.exit(1)
    else:
        stulog.logger.info("message=\"%s start\"", title)
        try:
            exit_status = run(ucc_setting)
        except EnvironmentError as e:
            if e.errno != errno.EINTR:
                stulog.logger.critical("message=\"%s "
                                       "exit abnormally\" "
                                       "detail_info=\"%s\"",
                                       title,
                                       traceback.format_exc(e))
            else:
                stulog.logger.info("message=\"%s exit "
                                   "normally\"", title)
        except ConfigException as e:
            stulog.logger.critical("message=\"%s "
                                   "exit due to failed to load config file\" "
                                   "detail_info=\"%s\"",
                                   title,
                                   traceback.format_exc(e))
        except UCCServerException as e:
            stulog.logger.critical("message=\"%s "
                                   "exit due to failed to UCC server internal error\" "
                                   "detail_info=\"%s\"",
                                   title,
                                   traceback.format_exc(e))
        except Exception as e:
            stulog.logger.critical("message=\"%s "
                                   "exit abnormally\" "
                                   "detail_info=\"%s\"",
                                   title,
                                   traceback.format_exc(e))
        else:
            if exit_status == ExitStatus.NOT_A_CAPTION:
                stulog.logger.debug("message=\"%s exit "
                                    "normally\"", title)
            else:
                stulog.logger.info("message=\"%s exit "
                                   "normally\"", title)

def create_debug_config():
    with open("inputs.xml") as f:
        mod = f.read()
    from splunktalib.credentials import CredentialManager
    session_key = CredentialManager.get_session_key("admin", "admin")
    mod = mod.replace("xxxxx", session_key)
    from splunktalib.modinput import parse_modinput_configs
    return parse_modinput_configs(mod)
