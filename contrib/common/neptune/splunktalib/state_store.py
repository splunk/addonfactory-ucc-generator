import os.path as op
import os
import json

from splunktalib.common import util
import splunktalib.rest as sr
import splunktalib.kv_client as kvc


def get_state_store(meta_configs, appname, collection_name=None,
                    use_kv_store=False, http=None):
    if util.is_true(use_kv_store):
        http = sr.HttpPoolManager(meta_configs).pool()
        return StateStore(meta_configs, appname, collection_name, http=http)
    else:
        return FileStateStore(meta_configs, appname)


class BaseStateStore(object):
    def __init__(self, meta_configs, appname):
        self._meta_configs = meta_configs
        self._appname = appname

    def update_state(self, key, state):
        pass

    def update_state_in_batch(self, states):
        """
        :param states: a list of dict which contains
        {
        "_key": xxx,
        "value": json_states,
        }
        """
        pass

    def get_state(self, key):
        pass

    def delete_state(self, key):
        pass


class StateStore(BaseStateStore):

    def __init__(self, meta_configs, appname, collection_name, http=None):
        """
        :meta_configs: dict like and contains checkpoint_dir, session_key,
         server_uri etc
        :app_name: the name of the app
        :collection_name: the collection name to be used.
        Don"t use other method to visit the collection if you are using
         StateStore to visit it.
        """
        super(StateStore, self).__init__(meta_configs, appname)

        self._kv_client = None
        if not collection_name:
            self._collection = appname
        else:
            self._collection = collection_name
        self._kv_client = kvc.KVClient(meta_configs["server_uri"],
                                       meta_configs["session_key"],
                                       http=http)
        kvc.create_collection(self._kv_client, self._collection, self._appname)

    def update_state(self, key, state):
        """
        :state: Any JSON serializable
        :return: None if successful, otherwise throws exception
        """

        val = self.get_state(key)
        if val is None:
            self._kv_client.insert_collection_data(
                self._collection, {"_key": key, "value": json.dumps(state)},
                self._appname)
        else:
            self._kv_client.update_collection_data(
                self._collection, key, {"value": json.dumps(state)},
                self._appname)

    def update_state_in_batch(self, states):
        self._kv_client.update_collection_data_in_batch(
            self._collection, states, self._appname)

    def delete_state(self, key):
        try:
            self._kv_client.delete_collection_data(
                self._collection, key, self._appname)
        except kvc.KVNotExists:
            pass

    def get_state(self, key):
        try:
            state = self._kv_client.get_collection_data(
                self._collection, key, self._appname)
        except kvc.KVNotExists:
            return None

        if not state:
            return None

        if "value" in state:
            value = state["value"]
        else:
            value = state

        try:
            value = json.loads(value)
        except Exception:
            return None

        return value


class FileStateStore(BaseStateStore):

    def __init__(self, meta_configs, appname):
        """
        :meta_configs: dict like and contains checkpoint_dir, session_key,
        server_uri etc
        """

        super(FileStateStore, self).__init__(meta_configs, appname)

    def update_state(self, key, state):
        """
        :state: Any JSON serializable
        :return: None if successful, otherwise throws exception
        """

        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        with open(fname + ".new", "w") as jsonfile:
            json.dump(state, jsonfile)
            jsonfile.flush()

        if op.exists(fname):
            try:
                os.remove(fname)
            except IOError:
                pass

        os.rename(fname + ".new", fname)

    def update_state_in_batch(self, states):
        for state in states:
            self.update_state(state["_key"], state["value"])

    def get_state(self, key):
        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        if op.exists(fname):
            try:
                with open(fname) as jsonfile:
                    state = json.load(jsonfile)
                    return state
            except IOError:
                return None
        else:
            return None

    def delete_state(self, key):
        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        if op.exists(fname):
            try:
                os.remove(fname)
            except IOError:
                pass
