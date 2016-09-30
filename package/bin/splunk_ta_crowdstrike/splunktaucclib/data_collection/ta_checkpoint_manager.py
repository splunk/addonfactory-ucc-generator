import ta_consts as c
import splunktalib.state_store as ss
import splunktaucclib.common.log as stulog
import re
import urllib


class TACheckPointMgr(object):
    SEPARATOR = "___"

    def __init__(self, meta_config, task_config):
        self._task_config = task_config
        self._store = ss.get_state_store(
            meta_config,
            task_config[c.appname],
            use_kv_store=self._use_kv_store())

    def _use_kv_store(self):
        use_kv_store = self._task_config.get(
            c.use_kv_store, False)
        if use_kv_store:
            stulog.logger.info("Stanza={} Using KV store for checkpoint"
                               .format(self._task_config[c.stanza_name]))
        return use_kv_store

    def get_ckpt_key(self):
        return self.key_formatter()

    def get_ckpt(self):
        key = self.get_ckpt_key()
        return self._store.get_state(key)

    def update_ckpt(self, ckpt):
        key = self.get_ckpt_key()
        self._store.update_state(key, ckpt)

    def remove_ckpt(self):
        key = self.get_ckpt_key()
        self._store.delete_state(key)

    def key_formatter(self):
        divide_value = [self._task_config[c.stanza_name]]
        for key in self._task_config[c.divide_key]:
            divide_value.append(self._task_config[key])
        key_str = TACheckPointMgr.SEPARATOR.join(divide_value)
        qualified_key_str = ""
        for i in range(len(key_str)):
            if re.match("[^\w]", key_str[i]):
                qualified_key_str += urllib.quote(key_str[i])
            else:
                qualified_key_str += key_str[i]
        return qualified_key_str
