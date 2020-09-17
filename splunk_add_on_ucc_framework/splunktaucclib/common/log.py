import sys
import logging
import splunktalib.common.log as stclog
basestring = str if sys.version_info[0] == 3 else basestring

_level_by_name = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'FATAL': logging.FATAL,
    'CRITICAL': logging.CRITICAL
}


def _get_log_level(log_level, default_level=logging.INFO):
    if not log_level:
        return default_level
    if isinstance(log_level, basestring):
        log_level = log_level.upper()
        for k, v in _level_by_name.items():
            if k.startswith(log_level):
                return v
    if isinstance(log_level, int):
        if log_level in list(_level_by_name.values()):
            return log_level
    return default_level


def set_log_level(log_level):
    """
    Set log level.
    """
    stclog.Logs().set_level(_get_log_level(log_level))


# Global logger
logger = stclog.Logs().get_logger("ucc_lib")


def reset_logger(name):
    """
    Reset logger.
    """

    stclog.reset_logger(name)

    global logger
    logger = stclog.Logs().get_logger(name)
