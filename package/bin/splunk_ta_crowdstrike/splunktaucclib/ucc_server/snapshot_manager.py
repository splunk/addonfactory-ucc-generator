"""
Snapshot management module.
"""

from copy import deepcopy

from splunktaucclib.common import md5_of_dict
from splunktaucclib.common.rwlock import RWLock
from splunktaucclib.ucc_server import UCCServerException


class SnapshotManagerException(UCCServerException):
    """
    Snapshot manager exception.
    """

    pass


class DispatchSnapshotManager(object):
    """
    Dispatch Snapshot manager.
    """

    # Separator between schema and sub-item name.
    SEP = "$$"

    # Snapshot keys.
    FORWARDER = "forwarder"
    FORWARDER_LIST = "forwarder_list"
    CHECKSUM = "checksum"

    def __init__(self, dispatch_schema_manager,
                 get_dispatch_snapshot_callback,
                 update_dispatch_snapshot_callback):
        """
        @dispatch_schema_manager: dispatch schema manager.
        @get_dispatch_snapshot_callback: callback for geting dispatch
                                         snapshot.
        @update_dispatch_snapshot_callback: callback for updating
                                            dispatch snapshot.
        """

        self._dispatch_schema_manager = dispatch_schema_manager
        self._get_dispatch_snapshot_callback = get_dispatch_snapshot_callback
        self._update_dispatch_snapshot_callback = \
            update_dispatch_snapshot_callback
        self._rwlock = RWLock()
        try:
            self._dispatch_snapshot = self._get_dispatch_snapshot_callback()
        except Exception as e:
            raise SnapshotManagerException(e)

    @classmethod
    def combined_name(cls, prefix, name):
        """
        Create a combined name.
        """

        return prefix + cls.SEP + name

    @classmethod
    def split_name(cls, combined_name):
        """
        Split combined name by SEP.
        """

        return combined_name.split(cls.SEP)

    def reload_snapshot(self):
        """
        Reload snapshot.
        """

        self._rwlock = RWLock()
        try:
            self._dispatch_snapshot = self._get_dispatch_snapshot_callback()
        except Exception as e:
            raise SnapshotManagerException(e)

    def delete_forwarder(self, forwarder):
        """
        Delete forwarder from snapshot.
        It will be deleted from "_forwarder_list" of all global settings and
        finally delete all inputs delpoyed on it.

        @forwarder: forwarder to delete.
        """

        with self._rwlock.writer_lock:
            for name, value in deepcopy(self._dispatch_snapshot).iteritems():
                if self.FORWARDER_LIST in value and \
                   forwarder in value[self.FORWARDER_LIST]:
                    self._dispatch_snapshot[name][self.FORWARDER_LIST].remove(
                        forwarder)
                elif self.FORWARDER in value and forwarder == value[
                        self.FORWARDER]:
                    del self._dispatch_snapshot[name]

    def get_global_settings(self):
        """
        Get global settings from snapshot.
        """

        global_settings = set()
        with self._rwlock.reader_lock:
            for key in self._dispatch_snapshot.keys():
                if key.split(self.SEP)[0] in \
                   self._dispatch_schema_manager.get_global_setting_schemas():
                    global_settings.add(key)

        return global_settings

    def get_global_setting_deployed_forwarders(self, global_setting):
        """
        Get all forwarders on which global setting has been deployed.

        @global_setting: global setting.
        @return: forwarders has been deployed successfully.
        """

        assert global_setting.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_global_setting_schemas(), \
            SnapshotManagerException("Wrong global setting: {}.".format(
                global_setting))

        with self._rwlock.reader_lock:
            try:
                return set(
                    self._dispatch_snapshot[
                        global_setting][self.FORWARDER_LIST])
            except KeyError:
                raise SnapshotManagerException(
                    "Non exits global setting: {}.".format(global_setting))
            except Exception as e:
                raise SnapshotManagerException(e)

        return set()

    def update_global_setting(self, global_setting, global_setting_setting,
                              forwarder):
        """
        Update global setting.
        """

        assert global_setting.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_global_setting_schemas(), \
            SnapshotManagerException(
                "Wrong global setting: {}.".format(global_setting))

        new_md5 = md5_of_dict(global_setting_setting)

        with self._rwlock.writer_lock:
            if global_setting in self._dispatch_snapshot and \
               self._dispatch_snapshot[global_setting][self.CHECKSUM] == new_md5 and \
               forwarder not in \
               self._dispatch_snapshot[global_setting][self.FORWARDER_LIST]:
                self._dispatch_snapshot[global_setting][
                    self.FORWARDER_LIST].append(forwarder)
            else:
                self._dispatch_snapshot[global_setting] = \
                    {self.FORWARDER_LIST: [forwarder], self.CHECKSUM: new_md5}

    def delete_global_setting(self, global_setting):
        """
        Update global setting.
        """

        assert global_setting.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_global_setting_schemas(), \
            SnapshotManagerException(
                "Wrong global setting: {}.".format(global_setting))

        with self._rwlock.writer_lock:
            del self._dispatch_snapshot[global_setting]

    def get_inputs(self):
        """
        Get all inputs from snapshot.
        """

        inputs = set()
        with self._rwlock.reader_lock:
            for key in self._dispatch_snapshot.keys():
                if key.split(self.SEP)[0] in \
                   self._dispatch_schema_manager.get_input_schemas():
                    inputs.add(key)

        return inputs

    def get_input_deployed_forwarder(self, _input):
        """
        Get input deployed forwarder.
        """

        assert _input.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_input_schemas(), \
            SnapshotManagerException("Wrong input: {}.".format(_input))

        with self._rwlock.reader_lock:
            try:
                return self._dispatch_snapshot[_input][self.FORWARDER]
            except KeyError:
                raise SnapshotManagerException(
                    "Non exits input: {}.".format(_input))
            except Exception as e:
                raise SnapshotManagerException(e)

    def update_input(self, _input, _input_setting, forwarder):
        """
        Update input.
        """

        assert _input.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_input_schemas(), \
            SnapshotManagerException("Wrong input: {}.".format(_input))

        with self._rwlock.writer_lock:
            try:
                if not forwarder:
                    if not _input_setting:
                        # Delete input
                        del self._dispatch_snapshot[_input]
                    else:
                        new_md5 = md5_of_dict(_input_setting)
                        self._dispatch_snapshot[_input][self.CHECKSUM] = \
                            new_md5
                else:
                    new_md5 = md5_of_dict(_input_setting)
                    self._dispatch_snapshot[_input] = {
                        self.FORWARDER: forwarder,
                        self.CHECKSUM: new_md5}
            except KeyError:
                raise SnapshotManagerException(
                    "Non exits input: {}.".format(_input))
            except Exception as e:
                raise SnapshotManagerException(e)

    def get_forwarder_load(self, forwarder):
        """
        Get forwarder load, it will search all inputs and
        accumulate all inputs deployed on this forwarder.

        @forwarder: forwarder.
        @return: forwarder load.
        """

        load = 0
        with self._rwlock.reader_lock:
            for key, value in self._dispatch_snapshot.iteritems():
                if key.split(self.SEP)[0] in \
                   self._dispatch_schema_manager.get_input_schemas() and \
                   value[self.FORWARDER] == forwarder:
                    load += 1

        return load

    def setting_is_changed(self, name, setting):
        """
        Check if setting of name is changed, it will compare the
        md5 between old and new setting.

        @name: setting name.
        @setting: new setting.
        @return: True if changed else False.
        """

        assert name.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_global_setting_schemas() or \
            name.split(self.SEP)[0] in \
            self._dispatch_schema_manager.get_input_schemas(), \
            SnapshotManagerException("Wrong setting: {}.".format(name))

        new_md5 = md5_of_dict(setting)
        with self._rwlock.reader_lock:
            try:
                return not new_md5 == \
                    self._dispatch_snapshot[name][self.CHECKSUM]
            except KeyError:
                raise SnapshotManagerException(
                    "Non exits setting: {}.".format(name))
            except Exception as e:
                raise SnapshotManagerException(e)

    def sync(self):
        """
        Sync snapshot.
        """

        with self._rwlock.writer_lock:
            try:
                self._update_dispatch_snapshot_callback(
                    self._dispatch_snapshot)
            except Exception as e:
                raise SnapshotManagerException(e)
