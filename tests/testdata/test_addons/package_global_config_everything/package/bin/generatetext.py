import time
import logging


def generate(self):
    logging.debug("Generating %d events with text %s" % (self.count, self.text))
    for i in range(1, self.count + 1):
        yield {'_serial': i, '_time': time.time(), '_raw': str(i) + '. ' + self.text}
