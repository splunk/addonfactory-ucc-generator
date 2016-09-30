import os.path as op
import os
import json

import splunktalib.kv_client as kvc
from splunktalib.common import util


def get_state_store(meta_configs,
                    appname,
                    collection_name="talib_states",
                    use_kv_store=False):
    if util.is_true(use_kv_store):
        return StateStore(meta_configs, appname, collection_name)
    else:
        return FileStateStore(meta_configs, appname)


class BaseStateStore(object):
    def __init__(self, meta_configs, appname):
        self._meta_configs = meta_configs
        self._appname = appname

    def update_state(self, key, states):
        pass

    def get_state(self, key):
        pass

    def delete_state(self, key):
        pass


class StateStore(BaseStateStore):
    def __init__(self, meta_configs, appname, collection_name="talib_states"):
        """
        :meta_configs: dict like and contains checkpoint_dir, session_key,
         server_uri etc
        :app_name: the name of the app
        :collection_name: the collection name to be used.
        Don"t use other method to visit the collection if you are using
         StateStore to visit it.
        """
        super(StateStore, self).__init__(meta_configs, appname)

        # State cache is a dict from _key to value
        self._states_cache = {}
        self._kv_client = None
        self._collection = collection_name
        self._kv_client = kvc.KVClient(meta_configs["server_uri"],
                                       meta_configs["session_key"])
        kvc.create_collection(self._kv_client, self._collection, self._appname)
        self._load_states_cache()

    def update_state(self, key, states):
        """
        :state: Any JSON serializable
        :return: None if successful, otherwise throws exception
        """

        if key not in self._states_cache:
            self._kv_client.insert_collection_data(
                self._collection, {"_key": key,
                                   "value": json.dumps(states)}, self._appname)
        else:
            self._kv_client.update_collection_data(
                self._collection, key, {"value": json.dumps(states)
                                        }, self._appname)
        self._states_cache[key] = states

    def get_state(self, key=None, reload_cache=False):
        if reload_cache:
            self._load_states_cache()
        if key:
            return self._states_cache.get(key, None)
        return self._states_cache

    def delete_state(self, key=None):
        if key:
            self._delete_state(key)
        else:
            [self._delete_state(key) for key in self._states_cache.keys()]

    def _delete_state(self, key):
        if key not in self._states_cache:
            return

        self._kv_client.delete_collection_data(
            self._collection, key, self._appname)
        del self._states_cache[key]

    def _load_states_cache(self):
        self._states_cache.clear()
        states = self._kv_client.get_collection_data(
            self._collection, None, self._appname)
        if not states:
            return

        for state in states:
            if "value" in state:
                value = state["value"]
            else:
                value = state

            try:
                value = json.loads(value)
            except Exception:
                pass

            self._states_cache[state["_key"]] = value


class FileStateStore(BaseStateStore):
    def __init__(self, meta_configs, appname):
        """
        :meta_configs: dict like and contains checkpoint_dir, session_key,
        server_uri etc
        """

        super(FileStateStore, self).__init__(meta_configs, appname)

    def update_state(self, key, states):
        """
        :state: Any JSON serializable
        :return: None if successful, otherwise throws exception
        """

        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        with open(fname + ".new", "w") as jsonfile:
            json.dump(states, jsonfile)

        if op.exists(fname):
            os.remove(fname)

        os.rename(fname + ".new", fname)
        # commented this to disable state cache for local file
        # if key not in self._states_cache:
        # self._states_cache[key] = {}
        # self._states_cache[key] = states

    def get_state(self, key):
        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        if op.exists(fname):
            with open(fname) as jsonfile:
                state = json.load(jsonfile)
                # commented this to disable state cache for local file
                # self._states_cache[key] = state
                return state
        else:
            return None

    def delete_state(self, key):
        fname = op.join(self._meta_configs["checkpoint_dir"], key)
        if op.exists(fname):
            os.remove(fname)
