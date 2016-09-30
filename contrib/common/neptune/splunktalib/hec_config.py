import traceback

from splunktalib.common import log
logger = log.Logs().get_logger("util")

import splunktalib.conf_manager.conf_manager as cm
import splunktalib.conf_manager.request as req
import splunktalib.common.util as utils


class HECConfig(object):
    """
    HTTP Event Collector configuration
    """

    input_type = "http"

    def __init__(self, splunkd_uri, session_key):
        self._conf_mgr = cm.ConfManager(splunkd_uri, session_key,
                                        app_name="splunk_httpinput")

    def update_settings(self, settings):
        """
        :settings: dict object
        {
        "enableSSL": 1/0,
        "disabled": 1/0,
        "useDeploymentServer": 1/0,
        "port": 8088,
        "output_mode": "json",
        }
        """

        try:
            self._conf_mgr.update_data_input(
                self.input_type, self.input_type, settings)
        except Exception:
            logger.error("Failed to update httpinput settings, reason=%s",
                         traceback.format_exc())
            raise

    def create_http_input(self, stanza):
        """
        :stanza: dict object
        {
        "name": "akamai",
        "index": "main", (optional)
        "sourcetype": "akamai:cm:json", (optional)
        "description": "xxx", (optional)
        "token": "A0-5800-406B-9224-8E1DC4E720B6", (optional)
        }
        """

        try:
            self._conf_mgr.create_data_input(
                self.input_type, stanza["name"], stanza)
        except req.ConfExistsException:
            pass
        except Exception:
            logger.error("Failed to create httpinput=%s, reason=%s",
                         stanza["name"], traceback.format_exc())
            raise

    def update_http_input(self, stanza):
        res = self.get_http_input(stanza["name"])
        if res is None:
            return self.create_http_input(stanza)

        self._conf_mgr.update_data_input(
            self.input_type, stanza["name"], stanza)

    def delete_http_input(self, name):
        """
        :name: string, http input name
        """

        try:
            self._conf_mgr.delete_data_input(self.input_type, name)
        except req.ConfNotExistsException:
            pass
        except Exception:
            logger.error("Failed to delete httpinput=%s, reason=%s",
                         name, traceback.format_exc())
            raise

    def get_http_input(self, name):
        """
        :name: string, http input name
        :return: list of http input config if successful or
        None when there is such http input or
        raise exception if other exception happened
        """

        try:
            return self._conf_mgr.get_data_input(self.input_type, name)
        except req.ConfNotExistsException:
            return None
        except Exception:
            logger.error("Failed to get httpinput=%s, reason=%s",
                         name, traceback.format_exc())
            raise

    def get_limits(self):
        return self._conf_mgr.get_stanza("limits", "http_input")

    def set_limits(self, limits):
        self._conf_mgr.update_stanza("limits", "http_input", limits)


def update_or_create_hec(config):
    """
    :param config:
    {
    "server_uri": xxx,
    "session_key": xxx,
    "hec_name": xxx,
    "hec_port": xxx,
    "use_hec": 0/1,
    "use_raw_hec": 0/1,
    }
    """

    use_hec = utils.is_true(config.get("use_hec"))
    use_raw_hec = utils.is_true(config.get("use_raw_hec"))
    if not use_hec and not use_raw_hec:
        return {}

    hec = HECConfig(config["server_uri"], config["session_key"])

    hec_input = hec.get_http_input(config["hec_name"])
    port = config.get("hec_port", 8088)
    if not hec_input:
        logger.info("Create HEC data input")
        hec_settings = {
            "enableSSL": 1,
            "port": port,
            "output_mode": "json",
            "disabled": 0,
        }
        hec.update_settings(hec_settings)
        input_settings = {
            "name": config["hec_name"],
        }
        hec.create_http_input(input_settings)
        hec_input = hec.get_http_input(config["hec_name"])

    hostname, _ = utils.extract_hostname_port(config["server_uri"])
    hec_uri = "https://{hostname}:{port}".format(hostname=hostname, port=port)
    if hec_input:
        hec_input[0]["hec_server_uri"] = hec_uri
        return hec_input[0]
    else:
        raise Exception("Failed to get HTTP input configuration")
