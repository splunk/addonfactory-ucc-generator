import os
import threading
import time
import traceback

from splunktalib.common import log

logger = log.Logs().get_logger("ta_util")


class OrphanProcessChecker(object):
    def __init__(self, callback=None):
        """
        Only work for Linux platform. On Windows platform, is_orphan is always
        False
        """

        if os.name == "nt":
            self._ppid = 0
        else:
            self._ppid = os.getppid()
        self._callback = callback

    def is_orphan(self):
        if os.name == "nt":
            return False
        return self._ppid != os.getppid()

    def check_orphan(self):
        res = self.is_orphan()
        if res and self._callback:
            self._callback()
        return res


class OrphanProcessMonitor(object):
    def __init__(self, callback):
        self._checker = OrphanProcessChecker(callback)
        self._thr = threading.Thread(target=self._do_monitor)
        self._thr.daemon = True
        self._started = False

    def start(self):
        if self._started:
            return
        self._started = True

        self._thr.start()

    def stop(self):
        self._started = False

    def _do_monitor(self):
        while self._started:
            try:
                res = self._checker.check_orphan()
                if res:
                    logger.warn("Process=%s has become orphan", os.getpid())
                    break
                time.sleep(1)
            except Exception:
                logger.error("Failed to monitor orphan process, reason=%s",
                             traceback.format_exc())
