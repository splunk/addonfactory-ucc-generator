import logging
import splunktalib.common.log as stclog


def set_log_level(log_level):
    """
    Set log level.
    """

    if isinstance(log_level, basestring):
        if log_level.upper() == "DEBUG":
            stclog.Logs().set_level(logging.DEBUG)
        elif log_level.upper() == "INFO":
            stclog.Logs().set_level(logging.INFO)
        elif log_level.upper() == "WARN":
            stclog.Logs().set_level(logging.WARN)
        elif log_level.upper() == "ERROR":
            stclog.Logs().set_level(logging.ERROR)
        else:
            stclog.Logs().set_level(logging.INFO)
    elif isinstance(log_level, int):
        if log_level in [logging.DEBUG, logging.INFO, logging.ERROR]:
            stclog.Logs().set_level(log_level)
        else:
            stclog.Logs().set_level(logging.INFO)
    else:
        stclog.Logs().set_level(logging.INFO)


# Global logger
logger = stclog.Logs().get_logger("ucc_lib")


def reset_logger(name):
    """
    Reset logger.
    """

    stclog.reset_logger(name)

    global logger
    logger = stclog.Logs().get_logger(name)
