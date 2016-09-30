import logging, logging.handlers

class AppPandaLogger:
    """
    This defines the logger used for logging AppPandaCLI
    and AppPandaUI events.
    """
    def __init__(self):
        
        self.logger = logging.getLogger('App-Panda-Logger')
        self.logger.propagate = False
        self.logger.setLevel(logging.DEBUG)

        file_handler = logging.handlers.RotatingFileHandler("AppPandaLogger.log", maxBytes=25000000, backupCount=5)
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        file_handler.setFormatter(formatter)
   
        self.logger.addHandler(file_handler)
   
    def get_logger(self):
        return self.logger