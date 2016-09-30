import logging, logging.handlers

class AppKoalaLogger:
    """
    This defines the logger used for logging AppKoalaCLI    
    """
    def __init__(self):
        
        self.logger = logging.getLogger('App-Koala-Logger')
        self.logger.propagate = False
        self.logger.setLevel(logging.DEBUG)

        file_handler = logging.handlers.RotatingFileHandler("AppKoalaLogger.log", backupCount=5, mode='w')
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        file_handler.setFormatter(formatter)
   
        self.logger.addHandler(file_handler)
   
    def get_logger(self):
        
        return self.logger