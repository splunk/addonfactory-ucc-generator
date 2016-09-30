"""
Copyright (C) 2005-2015 Splunk Inc. All Rights Reserved.
"""

import os
import datetime


def handle_tear_down_signals(callback):
    import signal

    signal.signal(signal.SIGTERM, callback)
    signal.signal(signal.SIGINT, callback)

    if os.name == "nt":
        signal.signal(signal.SIGBREAK, callback)


def datetime_to_seconds(dt):
    epoch_time = datetime.datetime.utcfromtimestamp(0)
    return (dt - epoch_time).total_seconds()


def is_true(val):
    value = str(val).strip().upper()
    if value in ("1", "TRUE", "T", "Y", "YES"):
        return True
    return False


def is_false(val):
    value = str(val).strip().upper()
    if value in ("0", "FALSE", "F", "N", "NO", "NONE", ""):
        return True
    return False


def remove_http_proxy_env_vars():
    for k in ("http_proxy", "https_proxy"):
        if k in os.environ:
            del os.environ[k]
        elif k.upper() in os.environ:
            del os.environ[k.upper()]


def get_appname_from_path(absolute_path):
    parts = absolute_path.split(os.path.sep)
    parts.reverse()
    try:
        idx = parts.index("apps")
    except ValueError:
        return None
    else:
        try:
            if parts[idx + 1] == "etc":
                return parts[idx - 1]
            return None
        except IndexError:
            return None


def escape_json_control_chars(json_str):
    control_chars = ((r"\n", "\\\\n"), (r"\r", "\\\\r"),
                     (r"\r\n", "\\\\r\\\\n"))
    for ch, replace in control_chars:
        json_str = json_str.replace(ch, replace)
    return json_str
