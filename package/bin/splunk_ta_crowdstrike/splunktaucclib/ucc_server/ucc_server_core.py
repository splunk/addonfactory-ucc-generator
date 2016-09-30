import time

import splunktalib.file_monitor as fm

from splunktaucclib.common import log
from splunktaucclib.ucc_server import UCCServerException
from splunktaucclib.ucc_server.filter_manager import FilterManager
from splunktaucclib.ucc_server.discovery_engine import DiscoveryEngine
from splunktaucclib.ucc_server.dispatch_engine import DispatchEngine
from splunktaucclib.config import ConfigException


class UCCServer(object):
    """
    Splunk TA UCC Server.
    """

    # Load ucc server input timeout
    LOAD_INPUT_TIMEOUT = 30
    # File change delay timeout
    FILE_CHANGE_DELAY_TIMEOUT = 5
    # Default log level
    DEFAULT_LOG_LEVEL = "INFO"

    def __init__(self,
                 server_uri,
                 session_key,
                 load_ucc_server_input_callback,
                 monitor_files,
                 ucc_server_input_filters,
                 division_schema,
                 dispatch_schema,
                 get_forwarders_snapshot_callback,
                 update_forwarders_snapshot_callback,
                 get_dispatch_snapshot_callback,
                 update_dispatch_snapshot_callback,
                 ucc_server_id,
                 get_log_level_callback=None):
        """
        Init ucc server.

        @server_uri: local ucc server uri.
        @session_key: local ucc server session key.
        @load_ucc_server_input_callback: load ucc server input callback.
        @monitor_files: files to monitor.
        @ucc_server_input_filters: filters for ucc server input filtering.
        @division_schema_settings: schema settings for input settings division.
        @dispatch_schema_settings: schema settings for input settings dispatch.
        @get_forwarders_snapshot_callback: get forwarders snapshot callback.
        @update_forwarders_snapshot_callback: update forwarders snapshot
                                              callback.
        @get_dispatch_snapshot_callback: get dispatch snapshot callback.
        @update_dispatch_snapshot_callback: update dispatch snapshot
                                            callback.
        @ucc_server_id: ucc server id.
        @get_log_level_callback: get log level callback.
        """

        assert server_uri, \
            UCCServerException("server_uri is None.")
        assert session_key, \
            UCCServerException("session_key is None.")
        assert load_ucc_server_input_callback, \
            UCCServerException("load_ucc_server_input_callback is None.")
        assert monitor_files, \
            UCCServerException("monitor_files is None.")
        assert ucc_server_input_filters, \
            UCCServerException("ucc_server_input_filters is None.")
        assert division_schema, \
            UCCServerException("division_schema_settings is None.")
        assert dispatch_schema, \
            UCCServerException("dispatch_schema_settings is None.")
        assert get_forwarders_snapshot_callback, \
            UCCServerException("get_forwarders_snapshot_callback is None.")
        assert update_forwarders_snapshot_callback, \
            UCCServerException("update_forwarders_snapshot_callback is None.")
        assert get_dispatch_snapshot_callback, \
            UCCServerException("get_dispatch_snapshot_callback is None.")
        assert update_dispatch_snapshot_callback, \
            UCCServerException("update_dispatch_snapshot_callback is None.")
        assert ucc_server_id, \
            UCCServerException("ucc_server_id is None.")

        self._load_ucc_server_input_callback = \
            load_ucc_server_input_callback
        self._file_monitor = fm.FileMonitor(None, monitor_files)
        self._filter_manager = FilterManager(ucc_server_input_filters)
        self._discovery_engine = DiscoveryEngine(division_schema,
                                                 ucc_server_id)
        self._dispatch_engine = DispatchEngine(
            server_uri,
            session_key,
            dispatch_schema,
            get_forwarders_snapshot_callback,
            update_forwarders_snapshot_callback,
            get_dispatch_snapshot_callback,
            update_dispatch_snapshot_callback,
            ucc_server_id)
        self._get_log_level = get_log_level_callback
        self._log_level = self.DEFAULT_LOG_LEVEL
        self._init = True
        self._stopped = False

    def _get_ucc_server_input(self):
        """
        Load ucc server input.

        @return: True if ucc_server_input is changed else False for timeout.
        """

        if self._init:
            self._init = False
            return (
                self._load_ucc_server_input_callback(reload_input=True),
                True)

        sleep_time = 0
        wait_timeout = self.LOAD_INPUT_TIMEOUT
        while not self._stopped:
            if self._file_monitor.check_changes():
                sleep_time = 0
                wait_timeout = self.FILE_CHANGE_DELAY_TIMEOUT

            time.sleep(1)
            sleep_time += 1
            if sleep_time >= wait_timeout:
                if wait_timeout == self.FILE_CHANGE_DELAY_TIMEOUT:
                    return (
                        self._load_ucc_server_input_callback(
                            reload_input=True),
                        True)
                else:
                    return (
                        self._load_ucc_server_input_callback(),
                        False)
        else:
            return None, False

    def start(self):
        """
        Start ucc server.
        """

        self._stopped = False

        dispatch_status = DispatchEngine.DISPATCH_FAIL
        try:
            while True:
                _input, input_changed = \
                    self._get_ucc_server_input()
                if self._stopped:
                    break

                if input_changed and self._get_log_level:
                    try:
                        log_level = self._get_log_level()
                    except ConfigException:
                        log_level = "INFO"
                    if self._log_level != log_level:
                        self._log_level = log_level
                        log.set_log_level(log_level)

                # Dispatch ucc_server_input
                if input_changed or \
                   dispatch_status == DispatchEngine.DISPATCH_FAIL:
                    dispatch_status = self._dispatch_settings(_input)
        except ConfigException as e:
            raise UCCServerException(e)
        finally:
            self._dispatch_engine.stop()

    def stop(self):
        """
        Stop ucc server.
        """

        self._stopped = True

    def _dispatch_settings(self, settings):
        """
        Dispatch settings.
        """

        settings = self._filter_manager.filter_settings(settings)
        settings = self._discovery_engine.divide_settings(settings)
        self._dispatch_status = self._dispatch_engine.dispatch_settings(
            settings)

        return self._dispatch_status
