import os
import random
import socket
import string
import urllib
import splunktaucclib.data_collection.ta_data_client as ta_data_client
import splunktaucclib.data_collection.ta_consts as ta_consts
from splunktaucclib.common.log import logger
from falcon_host_stream_api import consume, Stream


_SOURCE_TYPE = "crowdstrike:falconhost:json"


class FalconHostDataClient(ta_data_client.TaDataClient):
    # This class is not thread safe. Every worker thread should have initialized its own instance
    def __init__(
            self,
            all_conf_contents,
            meta_config,
            task_config,
            checkpoint=None,
            checkpoint_mgr=None
    ):
        super(FalconHostDataClient, self).__init__(
            all_conf_contents, meta_config, task_config, checkpoint, checkpoint_mgr)
        self._stanza = task_config[ta_consts.stanza_name]
        self._global = all_conf_contents['global_settings']
        self._input = all_conf_contents['inputs'][self._stanza]
        account_name = self._input['account']
        self._account = all_conf_contents['accounts'][account_name]
        self._index = None
        self._gen = None
        self._closer = None
        self._stream = None
        self._prev_offset = None
        self._initialized = False
        logger.setLevel(self._parse_log_level())
        self._log_configuration()

    def stop(self):
        self._closer()
        super(FalconHostDataClient, self).stop()

    def get(self):
        if not self._initialized:
            self.initialize()
            self._initialized = True

        if self.is_stopped():
            raise StopIteration

        try:
            offset, event = self._gen.next()
        except Exception as ex:
            logger.error("[%s] exception while _gen.next : %s", self._stanza, ex.message)
            self.stop()
            raise  # re-raise after closing

        logger.debug("[%s] event '%d' received (len = %d, time = %s)", self._stanza, offset,
                     len(event.data), event.time)
        self._prev_offset = offset
        events = [ta_data_client.build_event(
            time=event.time,
            index=self._index,
            source=event.source,
            sourcetype=_SOURCE_TYPE,
            raw_data=event.data
        )]
        return events, self._create_checkpoint(offset)

    def initialize(self):
        app_id, start_offset = self._parse_configurations()

        # if already consumer, consume next item (offset + 1)
        start_offset = start_offset + 1 if start_offset > 0 else start_offset
        api_uuid, api_key = self._parse_credentials()
        stream = self._create_stream_from_checkpoint()
        proxies = self._parse_proxies()
        self._stream, self._gen, self._closer = consume(
            api_uuid, api_key, start_offset, stream, fire_host=self._account.get('endpoint'),
            logger=lambda msg, *args: logger.info("[%s] " % self._stanza + msg, *args),
            app_id=app_id, proxies=proxies)

    def _create_stream_from_checkpoint(self):
        url = self._ckpt.get('url')
        token = self._ckpt.get('token')
        expire = self._ckpt.get('expire')
        return Stream(url=url, token=token, expire=expire) if url else None

    def _create_checkpoint(self, offset):
        return dict(
            url=self._stream.url,
            token=self._stream.token,
            expire=self._stream.expire,
            offset=offset
        )

    def _parse_proxies(self):
        proxy = self._global['crowdstrike_proxy']
        proxy_enabled = proxy['proxy_enabled'] == 'true' or str(proxy['proxy_enabled']) == '1'
        if proxy_enabled:
            proxy_type = proxy['proxy_type']
            proxy_url = proxy['proxy_url']
            proxy_port = proxy['proxy_port']
            proxy_username = proxy['proxy_username']
            proxy_password = proxy['proxy_password']
            proxy_str = '%s://%s:%s@%s:%s' % (proxy_type, proxy_username, proxy_password,
                                              proxy_url, str(proxy_port))
            # log url only to avoid sensitive
            logger.debug("[%s] using proxy url = %s", self._stanza, proxy_str)
            return dict(https=proxy_str, http=proxy_str)
        return None

    def _parse_log_level(self):
        return self._global['crowdstrike_loglevel']['loglevel']

    def _parse_credentials(self):
        api_uuid = self._account['api_uuid']
        api_key = self._account['api_key']
        logger.info("[%s] api_uuid : %s", self._stanza, api_uuid)
        return api_uuid, api_key

    def _parse_configurations(self):
        self._index = self._input['index']
        app_id_prefix = self._input.get('app_id', "splunk-ta")
        app_id = _get_process_identifier(app_id_prefix)
        start_offset = self._input.get('start_offset', -1)
        start_offset = self._ckpt.get('offset', start_offset)
        logger.info("[%s] app_id : %s, start_offset : %s", self._stanza, app_id, str(start_offset))
        return app_id, int(start_offset)

    def _log_configuration(self):
        logger.debug("[%s] global config : %s", self._stanza, self._all_conf_contents)
        logger.debug("[%s] task config : %s", self._stanza, self._task_config)
        logger.debug("[%s] checkpoint : %s", self._stanza, self._ckpt)


def _get_process_identifier(prefix):
    # 32 = max len for app id
    pid_str = str(os.getpid())
    host = urllib.quote(socket.gethostname())
    identifier = "%s-%s-%s" % (prefix, host, pid_str)
    if len(identifier) > 28:
        identifier = identifier[:28]

    # append 4 chars random string for retrying usage
    identifier += ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    return identifier.lower()
