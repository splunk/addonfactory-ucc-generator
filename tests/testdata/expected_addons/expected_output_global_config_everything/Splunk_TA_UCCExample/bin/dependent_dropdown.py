import import_declare_test
from solnlib import log
import splunk.admin as admin
import logging

logger = log.Logs().get_logger('dependent_dropdown')
logger.info("file_is getting executed")

class DropDownHandler(admin.MConfigHandler):

    def setup(self):
        if self.requestedAction == admin.ACTION_LIST:
            # Add required args in supported args
            self.supportedArgs.addReqArg("input_one_radio")
        return

    def handleList(self, confInfo):
        if self.callerArgs.data["input_one_radio"] == ["yes"]:
            confInfo["affirmation"] = ("key", "value")
        else:
            confInfo["denial"] = ("key_n", "value_n")

if __name__ == '__main__':
    logging.getLogger().addHandler(logging.NullHandler())
    admin.init(DropDownHandler, admin.CONTEXT_NONE)