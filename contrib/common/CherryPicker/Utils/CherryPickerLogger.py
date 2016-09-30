import logging, logging.handlers

class CherryPickerLogger:
    """
    This defines the logger used for logging Cherry Picker
    and it's events
    """
    def __init__(self):
        
        self.logger = logging.getLogger('Cherry-Picker-Logger')
        self.logger.propagate = False
        self.logger.setLevel(logging.DEBUG)

        file_handler = logging.handlers.RotatingFileHandler("CherryPickerLogger.log", maxBytes=25000000, backupCount=2)
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        file_handler.setFormatter(formatter)
   
        self.logger.addHandler(file_handler)
   
    def get_logger(self):
        return self.logger