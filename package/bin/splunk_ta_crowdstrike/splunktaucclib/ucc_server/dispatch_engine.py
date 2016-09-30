"""
This module provides dispatch engine object to dispatch settings.
"""

import os
import urllib
import json
import traceback
import threading
from multiprocessing import cpu_count
from copy import deepcopy
from concurrent import futures
from Queue import heapq

import splunktalib.rest as sr
import splunktalib.splunk_platform as ssp
import splunktalib.credentials as sc

from splunktaucclib.ucc_server.schema_manager import DispatchSchemaManager
from splunktaucclib.ucc_server.snapshot_manager import DispatchSnapshotManager
from splunktaucclib.common import log
from splunktaucclib.ucc_server import UCCServerException
from splunktaucclib.common.rwlock import RWLock


class DispatchEngineException(UCCServerException):
    """
    Dispatch engine exception.
    """

    pass


class ForwarderLoad(object):
    """
    Forwarder load info.
    """

    def __init__(self, forwarder, load):
        self._forwarder = forwarder
        self._load = load

    @property
    def forwarder(self):
        """
        Get forwarder.
        """

        return self._forwarder

    @property
    def load(self):
        """
        Get load.
        """

        return self._load

    @load.setter
    def load(self, load):
        """
        Set load.
        """

        self._load = load

    def __cmp__(self, other):
        assert isinstance(other, ForwarderLoad), \
            "Invalid type to compare: {}.".format(type(other))

        return cmp(self._load, other.load) or \
            cmp(self._forwarder, other.forwarder)


class DispatchEngine(object):
    """
    Dispatch engine.
    """

    # Action
    RESET_FORWARDER = 1
    DEPLOY_GLOBAL_SETTINGS = 2
    DEPLOY_INPUT = 3

    # Forwarder type
    FORWARDER_NEW = 1
    FORWARDER_EXIST = 2
    FORWARDER_DELETE = 3

    # Dispatch status
    DISPATCH_SUCCESS = 1
    DISPATCH_FAIL = 2

    # UCC server id name
    UCC_SERVER_ID = "ucc_server_id"

    def __init__(self, server_uri, session_key, dispatch_schema,
                 get_forwarders_snapshot_callback,
                 update_forwarders_snapshot_callback,
                 get_dispatch_snapshot_callback,
                 update_dispatch_snapshot_callback, ucc_server_id):
        """
        @server_uri: local server uri.
        @session_key: local session key.
        @dispatch_schema: dispatch schema.
        @get_forwarders_snapshot_callback: callback for geting forwarders
                                           snapshot.
        @update_forwarders_snapshot_callback: callback for updating
                                              forwarders snapshot.
        @get_dispatch_snapshot_callback: callback for geting dispatch
                                         snapshot.
        @update_dispatch_snapshot_callback: callback for updating
                                            dispatch snapshot.
        @ucc_server_id: ucc server id.
        """

        assert server_uri, "server_uri is None."
        assert session_key, "session_key is None."
        assert dispatch_schema, "dispatch_schema is None."
        assert get_forwarders_snapshot_callback, \
            "get_forwarders_snapshot_callback is None."
        assert update_forwarders_snapshot_callback, \
            "update_forwarders_snapshot_callback is None."
        assert get_dispatch_snapshot_callback, \
            "get_dispatch_snapshot_callback is None."
        assert update_dispatch_snapshot_callback, \
            "update_dispatch_snapshot_callback is None."
        assert ucc_server_id, "ucc_server_id is None."

        self._server_uri = server_uri
        self._session_key = session_key

        self._dispatch_schema_manager = DispatchSchemaManager(dispatch_schema)

        self._dispatch_snapshot_manager = DispatchSnapshotManager(
            self._dispatch_schema_manager, get_dispatch_snapshot_callback,
            update_dispatch_snapshot_callback)

        self._get_forwarders_snapshot_callback = \
            get_forwarders_snapshot_callback
        self._update_forwarders_snapshot_callback = \
            update_forwarders_snapshot_callback
        self._forwarders_snapshot = None
        self._forwarders_snapshot_lock = RWLock()

        self._threadpool_executor = futures.ThreadPoolExecutor(cpu_count())

        self._ucc_server_id = ucc_server_id

        # Current dispatch settings
        self._settings = None
        self._settings_lock = RWLock()

        # Forwarders available
        self._available_forwarderloads = None
        self._unavailable_forwarderloads = None
        self._forwarders_lock = RWLock()

        self._log_lock = threading.Lock()

    def _make_url(self, host, port, endpoint, resource=None, do_sync=False):
        """
        Make url from host, port and endpoint.
        """

        app_name = ssp.get_appname_from_path(os.path.abspath(__file__))
        assert app_name, "Get app name from path error."

        if host and port:
            url = "https://{}:{}/servicesNS/nobody/{}/{}".format(
                host, port, app_name, endpoint)
        else:
            url = "{}/servicesNS/nobody/{}/{}".format(self._server_uri,
                                                      app_name, endpoint)
        if resource:
            url = "{}/{}".format(url, urllib.quote(resource, ""))
        if do_sync:
            url = "{}/_sync".format(url)

        return url

    def _get_session_key(self, host, port, username, password):
        """
        Get session key.
        """

        if host and port:
            splunkd_uri = "https://{}:{}".format(host, port)
            return sc.CredentialManager.get_session_key(username, password,
                                                        splunkd_uri)
        else:
            return self._session_key

    def _handle_forwarders(self):
        """
        Handle settings of forwarders.
        """

        forwarder_schema = self._dispatch_schema_manager.get_forwarder_schema()
        forwarders = {forwarder_name: forwarder_setting
                      for forwarder_name, forwarder_setting in self._settings[
                          forwarder_schema].iteritems()}

        # Update available forwarders and forwarders dispatch map
        with self._forwarders_lock.writer_lock:
            self._available_forwarderloads = [
                ForwarderLoad(
                    forwarder,
                    self._dispatch_snapshot_manager.get_forwarder_load(
                        forwarder))
                for forwarder, forwarder_setting in forwarders.iteritems()
                if not self._dispatch_schema_manager.forwarder_is_disabled(
                    forwarder_setting)
            ]

            heapq.heapify(self._available_forwarderloads)
            self._unavailable_forwarderloads = []

        with self._forwarders_snapshot_lock.writer_lock:
            self._forwarders_snapshot = \
                self._get_forwarders_snapshot_callback()

            # Forwarders new to reset
            forwarders_reset_new = {
                forwarder_name: forwarder_setting
                for forwarder_name, forwarder_setting in forwarders.iteritems()
                if forwarder_name not in self._forwarders_snapshot
            }

            # Forwarders exist to reset
            forwarders_reset_exist = {
                forwarder_name: forwarder_setting
                for forwarder_name, forwarder_setting in forwarders.iteritems()
                if forwarder_name in self._forwarders_snapshot and
                self._dispatch_schema_manager.forwarder_is_disabled(
                    forwarder_setting)
            }

            # Forwarders delete to reset
            forwarders_reset_delete = {forwarder_name: forwarder_setting
                                       for forwarder_name, forwarder_setting in
                                       self._forwarders_snapshot.iteritems()
                                       if forwarder_name not in forwarders}

            # Update forwarder snapshot
            for forwarder_name, forwarder_setting in forwarders.iteritems():
                if forwarder_name in self._forwarders_snapshot:
                    self._forwarders_snapshot[forwarder_name] = \
                        deepcopy(forwarder_setting)
            try:
                self._update_forwarders_snapshot_callback(
                    self._forwarders_snapshot)
            except Exception as e:
                log.logger.warn("message=\"Update forwarders snapshot failed, "
                                "will try to update forwarders snapshot next "
                                "time\" "
                                "detail_info=\"%s\"", traceback.format_exc(e))
        handle_futures = []
        for forwarder_name, forwarder_setting in \
                forwarders_reset_new.iteritems():
            handle_futures.append(self._threadpool_executor.submit(
                self._reset_forwarder, forwarder_name, forwarder_setting,
                self.FORWARDER_NEW))

        for forwarder_name, forwarder_setting in \
                forwarders_reset_exist.iteritems():
            handle_futures.append(self._threadpool_executor.submit(
                self._reset_forwarder, forwarder_name, forwarder_setting,
                self.FORWARDER_EXIST))

        for forwarder_name, forwarder_setting in \
                forwarders_reset_delete.iteritems():
            handle_futures.append(self._threadpool_executor.submit(
                self._reset_forwarder, forwarder_name, forwarder_setting,
                self.FORWARDER_DELETE))
        # Wait until all tasks are done
        futures.wait(handle_futures, return_when=futures.ALL_COMPLETED)

    def _reset_forwarder(self, forwarder, forwarder_setting, forwarder_type):
        """
        Reset forwarder.
        """

        do_reset = False
        reset_success = True
        # For exist disabled forwarder, just return if forwarder load is 0
        if not forwarder_type == self.FORWARDER_EXIST or \
           self._dispatch_snapshot_manager.get_forwarder_load(forwarder):
            do_reset = True
            host, port, user_name, password = \
                self._dispatch_schema_manager.get_forwarder_info(
                    forwarder_setting)
            endpoint = self._dispatch_schema_manager.get_endpoint(
                self._dispatch_schema_manager.get_forwarder_schema())
            url = self._make_url(host, port, endpoint)
            try:
                session_key = self._get_session_key(host, port, user_name,
                                                    password)
            except Exception as e:
                # Update unavailable forwarders if get session key from a new
                # enabled forwarder fail
                if forwarder_type == self.FORWARDER_NEW and \
                   not self._dispatch_schema_manager.forwarder_is_disabled(
                       forwarder_setting):
                    self._update_unavailable_forwarders(forwarder,
                                                        self.RESET_FORWARDER)

                with self._log_lock:
                    log.logger.error(
                        "message=\"Reset forwarder:%s error\" "
                        "detail_info=\"Get session key failed:%s\"", forwarder,
                        traceback.format_exc(e))
                if forwarder_type == self.FORWARDER_DELETE:
                    reset_success = False
                else:
                    return self.DISPATCH_FAIL

            if reset_success:
                try:
                    response, content = sr.splunkd_request(
                        url,
                        session_key,
                        data={self.UCC_SERVER_ID: self._ucc_server_id},
                        timeout=120,
                        retry=3)
                except Exception:
                    # Update unavailable forwarders if reset a new enabled
                    # forwarder with Exception
                    if forwarder_type == self.FORWARDER_NEW and \
                       not self._dispatch_schema_manager.forwarder_is_disabled(
                           forwarder_setting):
                        self._update_unavailable_forwarders(
                            forwarder, self.RESET_FORWARDER)
                    with self._log_lock:
                        log.logger.error(
                            "message=\"Reset forwarder:%s error\" "
                            "detail_info=\"%s\"", forwarder, content)
                    reset_success = False
                    # return self.DISPATCH_FAIL

            if reset_success:
                if response is None or response.status not in (200, 201):
                    log.logger.error("message=\"Reset forwarder:%s error\" "
                                     "detail_info=\"%s\"", forwarder, content)

                    # Update unavailable forwarders if reset a new enabled
                    # forwarder fail
                    if forwarder_type == self.FORWARDER_NEW and \
                       not self._dispatch_schema_manager.forwarder_is_disabled(
                           forwarder_setting):
                        self._update_unavailable_forwarders(
                            forwarder, self.RESET_FORWARDER)
                    if forwarder_type == self.FORWARDER_DELETE:
                        reset_success = False
                    else:
                        return self.DISPATCH_FAIL

            if not forwarder_type == self.FORWARDER_EXIST:
                with self._forwarders_snapshot_lock.writer_lock:
                    if forwarder_type == self.FORWARDER_NEW:
                        self._forwarders_snapshot[forwarder] = \
                            forwarder_setting
                    else:
                        del self._forwarders_snapshot[forwarder]

                    try:
                        self._update_forwarders_snapshot_callback(
                            self._forwarders_snapshot)
                    except Exception as e:
                        if forwarder_type == self.FORWARDER_NEW and \
                           not self._dispatch_schema_manager.\
                           forwarder_is_disabled(forwarder_setting):
                            self._update_unavailable_forwarders(
                                forwarder, self.RESET_FORWARDER)
                        with self._log_lock:
                            log.logger.error("message=\"Reset forwarder:%s "
                                             "error\" "
                                             "detail_info=\"Update forwarders "
                                             "snapshot failed:%s\"", forwarder,
                                             traceback.format_exc(e))
                        if forwarder_type == self.FORWARDER_DELETE:
                            reset_success = False
                        else:
                            return self.DISPATCH_FAIL

        if not forwarder_type == self.FORWARDER_NEW:
            self._dispatch_snapshot_manager.delete_forwarder(forwarder)
            try:
                self._dispatch_snapshot_manager.sync()
            except Exception as e:
                with self._log_lock:
                    log.logger.error("message=\"Reset forwarder:%s error\" "
                                     "detail_info=\"Sync dispatch snapshot "
                                     "failed:%s\"", forwarder,
                                     traceback.format_exc(e))
                if forwarder_type == self.FORWARDER_DELETE:
                    reset_success = False
                else:
                    return self.DISPATCH_FAIL

        if do_reset and reset_success:
            with self._log_lock:
                log.logger.info("message=\"Reset forwarder:%s success\"",
                                forwarder)
        return self.DISPATCH_SUCCESS

    def _handle_global_settings(self):
        """
        Handle settings of global settings.
        """

        global_settings_snapshot = \
            self._dispatch_snapshot_manager.get_global_settings()
        global_settings = set()
        for global_setting_schema in \
                self._dispatch_schema_manager.get_global_setting_schemas():
            for global_setting_name in \
                    self._settings[global_setting_schema].keys():
                global_settings.add(DispatchSnapshotManager.combined_name(
                    global_setting_schema, global_setting_name))

        global_settings_new = set.difference(global_settings,
                                             global_settings_snapshot)
        global_settings_unchanged = set.intersection(global_settings_snapshot,
                                                     global_settings)
        # Handle delete global settings
        global_settings_delete = set.difference(global_settings_snapshot,
                                                global_settings)
        for global_setting in global_settings_delete:
            self._dispatch_snapshot_manager.delete_global_setting(
                global_setting)
        try:
            self._dispatch_snapshot_manager.sync()
        except Exception as e:
            log.logger.error("message=\"_handle_global_settings error\" "
                             "detail_info=\"Sync dispatch snapshot "
                             "failed:%s\"", traceback.format_exc(e))

        global_settings_changed = set()
        for global_setting in deepcopy(global_settings_unchanged):
            global_setting_schema, global_setting_name = \
                DispatchSnapshotManager.split_name(global_setting)
            if self._dispatch_snapshot_manager.setting_is_changed(
                    global_setting, self._settings[global_setting_schema][
                        global_setting_name]):
                global_settings_unchanged.remove(global_setting)
                global_settings_changed.add(global_setting)

        # Handle unchanged global settings
        global_settings_unchanged = \
            self._sort_global_settings(global_settings_unchanged)
        for global_setting in global_settings_unchanged:
            success_deployed_forwarders = \
                self._dispatch_snapshot_manager.\
                get_global_setting_deployed_forwarders(global_setting)
            with self._forwarders_lock.reader_lock:
                available_forwarders = {
                    forwarder_load.forwarder
                    for forwarder_load in self._available_forwarderloads
                }
                forwarders_to_deploy = set.difference(
                    available_forwarders, success_deployed_forwarders)

            # Deploy global setting
            deploy_futures = []
            for forwarder in forwarders_to_deploy:
                deploy_futures.append(self._threadpool_executor.submit(
                    self._deploy_global_setting, forwarder, global_setting))
            # Wait until all tasks are done
            futures.wait(deploy_futures, return_when=futures.ALL_COMPLETED)

        # Handle changed global settings
        global_settings_changed = self._sort_global_settings(
            global_settings_changed)
        for global_setting in global_settings_changed:
            with self._forwarders_lock.reader_lock:
                forwarders_to_deploy = {
                    forwarder_load.forwarder
                    for forwarder_load in self._available_forwarderloads
                }

            # Deploy global setting
            deploy_futures = []
            for forwarder in forwarders_to_deploy:
                deploy_futures.append(self._threadpool_executor.submit(
                    self._deploy_global_setting, forwarder, global_setting))
            # Wait until all tasks are done
            futures.wait(deploy_futures, return_when=futures.ALL_COMPLETED)

        # Handle new global settings
        global_settings_new = self._sort_global_settings(global_settings_new)
        for global_setting in global_settings_new:
            with self._forwarders_lock.reader_lock:
                forwarders_to_deploy = {
                    forwarder_load.forwarder
                    for forwarder_load in self._available_forwarderloads
                }
            # Deploy global setting
            deploy_futures = []
            for forwarder in forwarders_to_deploy:
                deploy_futures.append(self._threadpool_executor.submit(
                    self._deploy_global_setting, forwarder, global_setting))
            # Wait until all tasks are done
            futures.wait(deploy_futures, return_when=futures.ALL_COMPLETED)

    def _sort_global_settings(self, global_settings):
        """
        Sort global settings based on global setting priority.

        @global_settings: global settings to sort.
        @return: sorted global settings.
        """
        ordered_global_setting_schemas = \
            self._dispatch_schema_manager.get_ordered_global_setting_schemas()

        tmp = [(global_setting, ordered_global_setting_schemas.index(
            DispatchSnapshotManager.split_name(global_setting)[0]))
               for global_setting in global_settings]
        return [entry[0] for entry in sorted(tmp, key=lambda x: x[1])]

    def _deploy_global_setting(self, forwarder, global_setting):
        """
        Deploy global setting.

        @forwarder: forwarder to deploy.
        @global_setting: global setting.
        """

        with self._settings_lock.reader_lock:
            forwarder_schema = \
                self._dispatch_schema_manager.get_forwarder_schema()
            forwarder_setting = self._settings[forwarder_schema][forwarder]
            global_setting_schema, global_setting_name = \
                DispatchSnapshotManager.split_name(global_setting)
            global_setting_setting = \
                self._settings[global_setting_schema][global_setting_name]

        # Deploy global setting
        host, port, user_name, password = \
            self._dispatch_schema_manager.get_forwarder_info(
                forwarder_setting)
        endpoint = self._dispatch_schema_manager.get_endpoint(
            global_setting_schema)
        url = self._make_url(host,
                             port,
                             endpoint,
                             resource=global_setting_name,
                             do_sync=True)
        if user_name and password:
            try:
                session_key = self._get_session_key(host, port, user_name,
                                                    password)
            except Exception as e:
                self._update_unavailable_forwarders(
                    forwarder, self.DEPLOY_GLOBAL_SETTINGS)

                with self._log_lock:
                    log.logger.error(
                        "message=\"Deploy global setting:%s to "
                        "forwarder: %s error\" "
                        "detail_info=\"Get session key failed:%s\"",
                        global_setting, forwarder, traceback.format_exc(e))
                return self.DISPATCH_FAIL
        else:
            session_key = self._session_key

        try:
            response, content = sr.splunkd_request(
                url,
                session_key,
                method="POST",
                data=self._flatten_setting(global_setting_setting))
        except Exception as e:
            self._update_unavailable_forwarders(forwarder,
                                                self.DEPLOY_GLOBAL_SETTINGS)
            with self._log_lock:
                log.logger.error("message=\"Deploy global setting:%s to "
                                 "forwarder:%s error\" "
                                 "detail_info=\"%s\"", global_setting,
                                 forwarder, traceback.format_exc(e))
            return self.DISPATCH_FAIL

        if response is None or response.status not in (200, 201):
            self._update_unavailable_forwarders(forwarder,
                                                self.DEPLOY_GLOBAL_SETTINGS)
            with self._log_lock:
                log.logger.error("message=\"Deploy global setting:%s to "
                                 "forwarder:%s error\" "
                                 "detail_info=\"%s\"", global_setting,
                                 forwarder, content)
            return self.DISPATCH_FAIL

        # Update snapshot
        self._dispatch_snapshot_manager.update_global_setting(
            global_setting, global_setting_setting, forwarder)
        try:
            self._dispatch_snapshot_manager.sync()
        except Exception as e:
            self._update_unavailable_forwarders(forwarder,
                                                self.DEPLOY_GLOBAL_SETTINGS)
            with self._log_lock:
                log.logger.error("message=\"Deploy global setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"Sync snapshot failed:%s\"",
                                 global_setting, forwarder,
                                 traceback.format_exc(e))
            return self.DISPATCH_FAIL

        with self._log_lock:
            log.logger.info("message=\"Deploy global setting:%s "
                            "to forwarder:%s success\"", global_setting,
                            forwarder)
        return self.DISPATCH_SUCCESS

    def _handle_inputs(self):
        """
        Handle settings of inputs.
        """

        inputs_snapshot = self._dispatch_snapshot_manager.get_inputs()
        inputs = set()
        for input_schema in self._dispatch_schema_manager.get_input_schemas():
            for input_name in self._settings[input_schema].keys():
                inputs.add(DispatchSnapshotManager.combined_name(input_schema,
                                                                 input_name))

        inputs_delete = set.difference(inputs_snapshot, inputs)
        inputs_new = set.difference(inputs, inputs_snapshot)
        inputs_update = set.intersection(inputs_snapshot, inputs)
        for _input in deepcopy(inputs_update):
            input_schema, input_name = DispatchSnapshotManager.split_name(
                _input)
            if not self._dispatch_snapshot_manager.setting_is_changed(
                    _input, self._settings[input_schema][input_name]):
                inputs_update.remove(_input)

        handle_futures = []
        # Update inputs
        for _input in inputs_update:
            handle_futures.append(self._threadpool_executor.submit(
                self._update_input, _input))

        # Delete inputs
        for _input in inputs_delete:
            handle_futures.append(self._threadpool_executor.submit(
                self._delete_input, _input))

        # New inputs
        no_available_forwarder = False
        for _input in inputs_new:
            try:
                forwarder = self._get_next_forwarder()
                handle_futures.append(self._threadpool_executor.submit(
                    self._new_input, _input, forwarder))
            except DispatchEngineException:
                no_available_forwarder = True

        # Wait until all tasks are done
        futures.wait(handle_futures, return_when=futures.ALL_COMPLETED)
        for future in handle_futures:
            if future.result() == self.DISPATCH_FAIL:
                return self.DISPATCH_FAIL

        if no_available_forwarder:
            return self.DISPATCH_FAIL

        return self.DISPATCH_SUCCESS

    def _update_input(self, _input):
        """
        Update input.
        """

        with self._settings_lock.reader_lock:
            input_schema, input_name = DispatchSnapshotManager.split_name(
                _input)
            input_setting = self._settings[input_schema][input_name]

            forwarder = \
                self._dispatch_snapshot_manager.get_input_deployed_forwarder(
                    _input)
            forwarder_schema = \
                self._dispatch_schema_manager.get_forwarder_schema()
            if forwarder in self._settings[forwarder_schema]:
                forwarder_setting = self._settings[forwarder_schema][forwarder]
            else:
                # For forwarder which is deleted or disabled reset failed,
                # just skip for next handle round.
                return self.DISPATCH_FAIL

        # Update input
        host, port, user_name, password = \
            self._dispatch_schema_manager.get_forwarder_info(
                forwarder_setting)
        endpoint = self._dispatch_schema_manager.get_endpoint(input_schema)
        url = self._make_url(host,
                             port,
                             endpoint,
                             resource=input_name,
                             do_sync=True)
        if user_name and password:
            try:
                session_key = self._get_session_key(host, port, user_name,
                                                    password)
            except Exception as e:
                self._update_unavailable_forwarders(forwarder,
                                                    self.DEPLOY_INPUT)
                with self._log_lock:
                    log.logger.error(
                        "message=\"Update input setting:%s "
                        "to forwarder:%s error\" "
                        "detail_info=\"Get session key failed:%s\"", _input,
                        forwarder, traceback.format_exc(e))
                return self.DISPATCH_FAIL
        else:
            session_key = self._session_key

        try:
            response, content = sr.splunkd_request(
                url,
                session_key,
                method="POST",
                data=self._flatten_setting(input_setting))
        except Exception as e:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Update input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 traceback.format_exc(e))
            return self.DISPATCH_FAIL

        if response is None or response.status not in (200, 201):
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Update input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 content)
            return self.DISPATCH_FAIL

        # Update snapshot
        self._dispatch_snapshot_manager.update_input(_input, input_setting,
                                                     None)
        try:
            self._dispatch_snapshot_manager.sync()
        except Exception as e:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Update input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 traceback.format_exc(e))
            return self.DISPATCH_FAIL

        with self._log_lock:
            log.logger.info("message=\"Update input setting:%s "
                            "to forwarder:%s success\"", _input, forwarder)
        return self.DISPATCH_SUCCESS

    def _delete_input(self, _input):
        """
        Delete input.
        """

        with self._settings_lock.reader_lock:
            forwarder = \
                self._dispatch_snapshot_manager.get_input_deployed_forwarder(
                    _input)
            forwarder_schema = \
                self._dispatch_schema_manager.get_forwarder_schema()

            if forwarder in self._settings[forwarder_schema]:
                forwarder_setting = self._settings[forwarder_schema][forwarder]
            else:
                # For forwarder which is deleted or disabled reset failed,
                # just skip for next handle round.
                return self.DISPATCH_FAIL

        # Delete input
        host, port, user_name, password = \
            self._dispatch_schema_manager.get_forwarder_info(
                forwarder_setting)
        input_schema, input_name = \
            DispatchSnapshotManager.split_name(_input)
        endpoint = self._dispatch_schema_manager.get_endpoint(input_schema)
        url = self._make_url(host, port, endpoint, resource=input_name)
        if user_name and password:
            try:
                session_key = self._get_session_key(host, port, user_name,
                                                    password)
            except Exception as e:
                self._update_unavailable_forwarders(forwarder,
                                                    self.DEPLOY_INPUT)

                with self._log_lock:
                    log.logger.error(
                        "message=\"Delete input setting:%s "
                        "from forwarder:%s error\" "
                        "detail_info=\"Get session key failed:%s\"", _input,
                        forwarder, traceback.format_exc(e))
                return self.DISPATCH_FAIL
        else:
            session_key = self._session_key

        try:
            response, content = sr.splunkd_request(url,
                                                   session_key,
                                                   method="DELETE")
        except Exception:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)

            with self._log_lock:
                log.logger.error("message=\"Delete input setting:%s "
                                 "from forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 content)
            return self.DISPATCH_FAIL

        if response is None or response.status not in (200, 201):
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)

            with self._log_lock:
                log.logger.error("message=\"Delete input setting:%s "
                                 "from forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 content)
            return self.DISPATCH_FAIL

        # Update snapshot
        self._dispatch_snapshot_manager.update_input(_input, None, None)
        try:
            self._dispatch_snapshot_manager.sync()
        except Exception as e:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)

            with self._log_lock:
                log.logger.error("message=\"Delete input setting:%s "
                                 "from forwarder:%s error\" "
                                 "detail_info=\"Sync snapshot failed:%s\"",
                                 _input, forwarder, traceback.format_exc(e))
            return self.DISPATCH_FAIL

        with self._log_lock:
            log.logger.info("message=\"Delete input setting:%s "
                            "from forwarder:%s success", _input, forwarder)
        return self.DISPATCH_SUCCESS

    def _new_input(self, _input, forwarder):
        """
        Create new input.
        """

        with self._settings_lock.reader_lock:
            input_schema, input_name = \
                DispatchSnapshotManager.split_name(_input)
            input_setting = self._settings[input_schema][input_name]

            forwarder_schema = \
                self._dispatch_schema_manager.get_forwarder_schema()
            forwarder_setting = self._settings[forwarder_schema][forwarder]

        # Create new input
        host, port, user_name, password = \
            self._dispatch_schema_manager.get_forwarder_info(
                forwarder_setting)
        endpoint = self._dispatch_schema_manager.get_endpoint(input_schema)
        url = self._make_url(host,
                             port,
                             endpoint,
                             resource=input_name,
                             do_sync=True)
        if user_name and password:
            try:
                session_key = self._get_session_key(host, port, user_name,
                                                    password)
            except Exception as e:
                self._update_unavailable_forwarders(forwarder,
                                                    self.DEPLOY_INPUT)
                with self._log_lock:
                    log.logger.error(
                        "message=\"Deploy input setting:%s "
                        "to forwarder:%s error\" "
                        "detail_info=\"Get session key failed:%s\"", _input,
                        forwarder, traceback.format_exc(e))
                return self.DISPATCH_FAIL
        else:
            session_key = self._session_key

        try:
            response, content = sr.splunkd_request(
                url,
                session_key,
                method="POST",
                data=self._flatten_setting(input_setting))
        except Exception as e:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Deploy input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 traceback.format_exc(e))
            return self.DISPATCH_FAIL

        if response is None or response.status not in (200, 201):
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Deploy input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"%s\"", _input, forwarder,
                                 content)
            return self.DISPATCH_FAIL

        # Update snapshot
        self._dispatch_snapshot_manager.update_input(_input, input_setting,
                                                     forwarder)
        try:
            self._dispatch_snapshot_manager.sync()
        except Exception as e:
            self._update_unavailable_forwarders(forwarder, self.DEPLOY_INPUT)
            with self._log_lock:
                log.logger.error("message=\"Deploy input setting:%s "
                                 "to forwarder:%s error\" "
                                 "detail_info=\"Sync snapshot failed:%s\"",
                                 _input, forwarder, traceback.format_exc(e))
            return self.DISPATCH_FAIL

        with self._log_lock:
            log.logger.info("message=\"Deploy input setting:%s "
                            "to forwarder:%s success\"", _input, forwarder)
        return self.DISPATCH_SUCCESS

    def _get_next_forwarder(self):
        """
        Get next available forwarder. It will accumulate forwarder load
        and return forwarder with minimal load.
        """

        with self._forwarders_lock.reader_lock:
            try:
                forwarder_load = heapq.heappop(self._available_forwarderloads)
                forwarder = forwarder_load.forwarder
                forwarder_load.load += 1
                heapq.heappush(self._available_forwarderloads, forwarder_load)
                return forwarder
            except IndexError:
                raise DispatchEngineException("No available forwarders")

    def _update_unavailable_forwarders(self, forwarder, action):
        """
        Update forwarder status.
        """

        with self._forwarders_lock.reader_lock:
            if forwarder in {
                    forwarder_load.forwarder
                    for forwarder_load in self._available_forwarderloads
            }:
                for index, entry in enumerate(deepcopy(
                    self._available_forwarderloads)):
                    if entry.forwarder == forwarder:
                        if action == self.DEPLOY_INPUT:
                            entry.load -= 1
                        self._unavailable_forwarderloads.append(entry)
                        del self._available_forwarderloads[index]
                        heapq.heapify(self._available_forwarderloads)
                        break
            else:
                for index, entry in enumerate(
                    self._unavailable_forwarderloads):
                    if entry.forwarder == forwarder:
                        if action == self.DEPLOY_INPUT:
                            entry.load -= 1
                        break

    @classmethod
    def _flatten_setting(cls, setting):
        """
        Translate setting to one level.
        {                            {
            "key1:{                      "key1": "{\"key1\": value2}"
                "key2": value2  -->  }
            }
        }
        """

        assert isinstance(setting, dict), \
            ValueError("Invalid setting, should be a dict.")

        return {key: unicode.encode(value, "utf-8")
                if isinstance(value, unicode) else json.dumps(value)
                for key, value in setting.iteritems()}

    def dispatch_settings(self, settings):
        """
        Dispatch settings.
        """

        # Check settings
        self._dispatch_schema_manager.check_settings_are_valid(settings)

        with self._settings_lock.writer_lock:
            self._settings = settings

        # Reload dispatch snapshot
        self._dispatch_snapshot_manager.reload_snapshot()

        # Handle forwarders
        self._handle_forwarders()

        # Handle global settings
        with self._forwarders_lock.reader_lock:
            available_forwarders_num = len(self._available_forwarderloads)

        if available_forwarders_num:
            self._handle_global_settings()

        # Handle inputs
        with self._forwarders_lock.reader_lock:
            available_forwarders_num = len(self._available_forwarderloads)

        if available_forwarders_num:
            return self._handle_inputs()
        else:
            return self.DISPATCH_SUCCESS

    def stop(self):
        """
        Stop dispatch engine.
        """

        self._threadpool_executor.shutdown()
