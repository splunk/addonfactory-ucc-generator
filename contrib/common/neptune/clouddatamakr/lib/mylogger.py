import logging
import os

loggername = "clouddatamakr"

def get_logger():
    init_logger()
    return logging.getLogger(loggername)

def init_logger(service=loggername, fstream=True):
    logger = logging.getLogger(loggername)
    logger.setLevel(logging.DEBUG)

    fmt = logging.Formatter("[%(levelname)s %(asctime)s] [%(filename)s:%(lineno)d] %(message)s", "%m-%d %H:%M:%S")

    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    logger.addHandler(sh)

    if fstream:
        # add file handler
        logpath = os.path.join(os.path.dirname(__file__), "logs/")
        if not os.path.exists(logpath):
            os.makedirs(logpath)
        logfile = os.path.join(logpath + service +".log")
        fh = logging.FileHandler(logfile)
        fh.setFormatter(fmt)
        logger.addHandler(fh)

    logger.info("%s init %s_log %s", "="*20, service, "="*20)
