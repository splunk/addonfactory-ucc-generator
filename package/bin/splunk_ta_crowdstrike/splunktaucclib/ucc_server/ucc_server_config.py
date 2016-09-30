import re
import uuid
from copy import deepcopy
from splunktaucclib.common import load_schema_file as ld
from splunktaucclib.config import ConfigException


class UccServerConfigException(ConfigException):
    """
    MS O365 Ucc Server exception.
    """

    pass


class UCCServerConfigLoader(object):
    def __init__(self, ucc_config, id_locator=None,
                 logging_locator=None, local_forwarder_locator=None,
                 forwarders_snapshot_locator=None, dispatch_snapshot_locator=None):
        super(UCCServerConfigLoader, self).__init__()
        self.ucc_config = ucc_config
        self.ucc_server_input_cache = None

        assert id_locator and logging_locator and local_forwarder_locator and \
            forwarders_snapshot_locator and dispatch_snapshot_locator, \
            "Server Config locators cannot be empty: " + str((id_locator, logging_locator, local_forwarder_locator,
                                                              forwarders_snapshot_locator, dispatch_snapshot_locator))

        _get_dct = lambda s: dict(zip(['schema', 'stanza', 'field'], re.split(r"\s*[>,]\s*", s)))

        self.ousis = _get_dct(id_locator)
        self.ousls = _get_dct(logging_locator)
        self.ouslfs = _get_dct(local_forwarder_locator)
        self.ousfss = _get_dct(forwarders_snapshot_locator)
        self.ousdss = _get_dct(dispatch_snapshot_locator)

    def load_ucc_server_input(self, reload_input=False):
        """
        Load ucc server input by config module.
        """

        if not self.ucc_server_input_cache or reload_input:
            self.ucc_server_input_cache = self.ucc_config.load()

        return deepcopy(self.ucc_server_input_cache)

    def get_ucc_server_id(self, create_if_empty=False):
        """
        Get ucc server id.
        """

        us_input = self.load_ucc_server_input()
        ret = us_input[self.ousis["schema"]][self.ousis["stanza"]][self.ousis["field"]]
        if not ret and create_if_empty:
            ret = self.update_ucc_server_id()
        return ret

    def update_ucc_server_id(self, ):
        """
        Update ucc server id.
        """

        ucc_server_id = str(uuid.uuid4())

        ret = self.ucc_config.update_items(self.ousis["schema"], [self.ousis["stanza"]],
                                           [self.ousis["field"]],
                                           {self.ousis["stanza"]: {self.ousis["field"]: ucc_server_id}})
        assert not ret, UccServerConfigException("Update ucc server id error.")

        self.ucc_server_input_cache[self.ousis["schema"]][self.ousis["stanza"]][self.ousis["field"]] = \
            ucc_server_id

        return ucc_server_id

    def get_ucc_server_log_level(self, ):
        """
        Get ucc server id.
        """

        us_input = self.load_ucc_server_input()
        return us_input[self.ousls["schema"]][self.ousls["stanza"]][self.ousls["field"]]

    def enable_local_forwarder(self, ):
        """
        Enable local forwarder.
        """
        ret = self.ucc_config.update_items(self.ouslfs["schema"], [self.ouslfs["stanza"]],
                                           [self.ouslfs["field"]],
                                           {self.ouslfs["stanza"]: {self.ouslfs["field"]: "0"}})
        assert not ret, UccServerConfigException(
            "Enable local forwarder error.")

    def get_forwarders_snapshot(self, ):
        """
        Get forwarders snapshot.
        """

        us_input = self.load_ucc_server_input()
        return us_input[self.ousfss["schema"]][self.ousfss["stanza"]][self.ousfss["field"]]

    def update_forwarders_snapshot(self, forwarders_snapshot):
        """
        Update forwarders snapshot.
        """

        ret = self.ucc_config.update_items(self.ousfss["schema"], [self.ousfss["stanza"]],
                                           [self.ousfss["field"]],
                                           {self.ousfss["stanza"]: {self.ousfss["field"]: forwarders_snapshot}})
        assert not ret, UccServerConfigException(
            "Update forwarders snapshot error.")

        self.ucc_server_input_cache[self.ousfss["schema"]][self.ousfss["stanza"]][self.ousfss["field"]] = \
            forwarders_snapshot

    def get_dispatch_snapshot(self, ):
        """
        Get dispatch snapshot.
        """

        us_input = self.load_ucc_server_input()
        return us_input[self.ousdss["schema"]][self.ousdss["stanza"]][self.ousdss["field"]]

    def update_dispatch_snapshot(self, dispatch_snapshot):
        """
        Update forwarders snapshot.
        """

        ret = self.ucc_config.update_items(self.ousdss["schema"], [self.ousdss["stanza"]],
                                           [self.ousdss["field"]],
                                           {self.ousdss["stanza"]: {self.ousdss["field"]: dispatch_snapshot}})
        assert not ret, UccServerConfigException(
            "Update dispatch snapshot error.")

        self.ucc_server_input_cache[self.ousdss["schema"]][self.ousdss["stanza"]][self.ousdss["field"]] = \
            dispatch_snapshot


def get_schema(schema_file_path):
    # load schema
    ucc_schema = ld(schema_file_path)
    return _parse_schema(ucc_schema)


def _parse_schema(ucc_schema):
    setting = dict()

    try:
        setting["title"] = ucc_schema["basic"]["title"]
        setting["description"] = ucc_schema["basic"]["description"]

        setting["meta.id"] = ucc_schema["basic"]["config_meta"]["id_setting"]
        setting["meta.logging"] = ucc_schema["basic"]["config_meta"]["logging_setting"]
        setting["meta.local_forwarder"] = ucc_schema["basic"]["config_meta"]["local_forwarder_setting"]
        setting["meta.forwarder_snapshot"] = ucc_schema["basic"]["config_meta"]["forwarders_snapshot_setting"]
        setting["meta.dispatch_snapshot"] = ucc_schema["basic"]["config_meta"]["dispatch_snapshot_setting"]
        setting["monitor_file"] = ucc_schema["basic"]["monitor_file"]

        setting["config"] = ucc_schema["config"]
        setting["filter"] = ucc_schema["filter"]
        setting["division"] = ucc_schema["division"]
        setting["dispatch"] = ucc_schema["dispatch"]

        return setting

    except KeyError as ex:
        raise UccServerConfigException("Cannot find require key in schema file: {}".format(ex.message))
