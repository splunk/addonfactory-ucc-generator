# encoding = utf-8

from builtins import object
import time
import logging
import json

from solnlib import log

def message(app, current_time, event, tags):
    final_event = dict(event)
    final_event['mcollector_event_ts'] = current_time
    final_event['mcollector_target_app'] = app
    if tags:
        final_event['mcollector_tags'] = tags
    return json.dumps(final_event)


class MetricEventWriter(object):
    def __init__(self, app, config):
        '''
        config is a dict, which contains all the params for file writer
         - tag_black_list: a list of tags, if the tags are in the black list, do not write the event
         - tag_white_list: a list of tags, only write the event has this tags. white_list has higer priority than black_list
        '''
        assert app is not None
        assert isinstance(config, dict)
        self._app = app
        self._deny_list_tags = config.get('tag_black_list', [])
        self._allow_list_tags = config.get('tag_white_list', [])

    def write_event(self, ev, tags=[]):
        '''
        ev. event dict, it might be a hierarchy structure
        '''
        assert isinstance(ev, dict)
        assert isinstance(tags, list)
        if self._allow_list_tags:
            filter_tags = [t for t in tags if t in self._allow_list_tags]
            if filter_tags:
                self._flush_event(ev, tags)
            # else: no tags found in allow_list, just skip this event
            return

        if self._deny_list_tags and tags:
            filter_tags = [t for t in tags if t in self._deny_list_tags]
            if filter_tags:
                # skip this event
                return

        self._flush_event(ev, tags)

    def _flush_event(self, ev, tags):
        ctime = int(time.time() * 1000)  # ms
        self._flush_msg(message(self._app, ctime, ev, tags))

    def _flush_msg(self, msg):
        '''
        this should be implemented
        '''
        raise NotImplemented('_flush_msg should be implemented.')

    def update_config(self, config):
        self._deny_list_tags = config.get('tag_black_list', [])
        self._allow_list_tags = config.get('tag_white_list', [])


class FileEventWriter(MetricEventWriter):
    def __init__(self, app, config):
        super(FileEventWriter, self).__init__(app, config)
        self._logger_name = config.get('logger', 'default') + '_metric_events'
        self._logger = log.Logs().get_logger(self._logger_name)
        self._log_level = config.get('loglevel', 'INFO')
        log.Logs().set_level(self._log_level, self._logger_name)
        # reset the formater of log handler
        for handler in self._logger.handlers:
            handler.setFormatter(logging.Formatter('%(message)s'))

    def update_config(self, config):
        super(FileEventWriter, self).update_config(config)
        l_name = config.get('logger', 'default') + '_metric_events'
        if l_name != self._logger_name:
            self._logger_name = l_name
            self._logger = log.Logs().get_logger(self._logger_name)
        l_level = config.get('loglevel', 'INFO')
        if self._log_level != l_level:
            self._log_level = l_level
            log.Logs().set_level(self._log_level, self._logger_name)

    def _flush_msg(self, msg):
        self._logger.info(msg)

class SplunkStashFileWriter(MetricEventWriter):
    '''
    write a small file and use splunk rest upload this file
    '''
    def __init__(self, app, config):
        super(SplunkStashFileWriter, self).__init__(app, config)
        pass

    def update_config(self, config):
        super(FileEventWriter, self).update_config(config)
        pass

    def _flush_msg(self, msg):
        pass
