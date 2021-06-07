# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0


# encoding = utf-8

from past.builtins import str
from builtins import str
from six import string_types as str
import functools

from . import monitor
import time

__all__ = ['initialize_metric_collector', 'function_run_time']


def initialize_metric_collector(config, update_config=False):
    '''
    config is a configuration dict.
     - app: required field, define the app name for the monitor
     - event_writer: event writer type, must be one of ['file', 'hec']
     - writer_config: a dict, define the configuration for the event writer.
                     different event writer has different configurations.
    update_config: force to update the configure
    '''
    m = monitor.Monitor().configure(config, force_update=update_config)
    m.start()


def write_event(ev, tags=[]):
    monitor.Monitor().write_event(ev, tags)


CREDENTIAL_KEYS = ['password', 'passwords', 'token']


def mask_credentials(data):
    '''
    The argument will be cloned
    '''
    masked_str = '******'
    if isinstance(data, dict):
        new_data = {}
        for k in list(data.keys()):
            if isinstance(k, str):
                _key = k.lower()
                sensitive_word = False
                for w in CREDENTIAL_KEYS:
                    if w in _key:
                        sensitive_word = True
                        break
                if sensitive_word:
                    new_data[k] = masked_str
                else:
                    new_data[k] = mask_credentials(data[k])
            else:
                new_data[k] = mask_credentials(data[k])
        return new_data
    elif isinstance(data, (list, tuple)):
        new_data = []
        for d in data:
            new_data.append(mask_credentials(d))
        return new_data
    elif isinstance(data, str):
        d = data.lower()
        sensitive_word = False
        for w in CREDENTIAL_KEYS:
            if w in d:
                sensitive_word = True
                break
        if sensitive_word:
            return masked_str
    elif not isinstance(data, (int, float)):
        return 'Class:' + data.__class__.__name__
    return data


max_length = 2048


def function_run_time(tags=[]):
    def apm_decorator(func):
        @functools.wraps(func)
        def func_wrappers(*args, **kwargs):
            m = monitor.Monitor()
            func_attr = {'function_name': func.__name__,
                         'positional_args': str(mask_credentials(args))[0:max_length],
                         'keyword_arguments': str(mask_credentials(kwargs))[0:max_length]}
            ev = {'action': 'invoke'}
            ev.update(func_attr)
            m.write_event(ev, tags)
            before_invoke = int(time.time() * 1000)
            ret = func(*args, **kwargs)
            after_invoke = int(time.time() * 1000)
            ev = {'action': 'done',
                  'time_cost': (after_invoke - before_invoke)}
            ev.update(func_attr)
            m.write_event(ev, tags)
            return ret

        return func_wrappers

    return apm_decorator


# TODO: should put this into unit test
# class A(object):
#     def __init__(self):
#         self.password = 'abc'
#
# if __name__ == "__main__":
#     aa = {'a': {'token': '123'}, 'b': A()}
#     print mask_credentials(aa)
#     print aa
#     print mask_credentials(123)
#     bb = {'l': [{'token': 123, 'password': '444'}]}
#     print mask_credentials(bb)
#     print bb
