import traceback
import sys
import os
import string
import logging
import importlib

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class CloudDataMakr(object):
    def __init__(self, product, service=None, *args, **kwargs):

        self.product = product
        self.service = service
        self.args = args
        self.kwargs = kwargs
        self.generator = None

        try:
            sys.path.append(self.product)
            module_path = self.service
            module_name = importlib.import_module(module_path)
            logger.debug("Loading module %s", module_name)
            className = self.lookup_service(self.service)
            generator = getattr(module_name, className)(*self.args,
                                                        **self.kwargs)
            if generator is None:
                raise Exception("Failed to init generator for %s-%s", product,
                                service)

            self.generator = generator
        except Exception:
            traceback.print_exc()

    def gen(self, *args, **kwargs):
        try:
            self.generator.gen()
        except Exception:
            traceback.print_exc()

    # Override default configuration on the fly
    def configure(self, key, value):
        pass

    def lookup_service(self, service=None):
        return string.capitalize(service) + 'EventGen'

    def cleanup(self, *args, **kwargs):
        if self.generator:
            self.generator.cleanup()
        else:
            raise Exception(
                "Failed to find valid generator, can not performn cleanup!")

# Test script
if __name__ == "__main__":

    from lib.utils import readconf
    from argparse import ArgumentParser
    from argparse import REMAINDER

    parser = ArgumentParser(
        description="Neptune - A data generator for cloud services")
    parser.add_argument("-p",
                        "--product",
                        action="store",
                        default=None,
                        dest="product")
    parser.add_argument("-s",
                        "--service",
                        action="store",
                        default=None,
                        dest="service")
    parser.add_argument("-c",
                        "--config",
                        action="store",
                        default=None,
                        dest="config")
    parser.add_argument("-C", "--cleanup", action="store_true", dest="cleanup")
    parser.add_argument('restargs', nargs=REMAINDER)
    options = parser.parse_args()

    if not options.config:
        if not options.product:
            raise Exception("Must specify product!")
        config_path = "configs/" + options.product + ".conf"
        if not os.path.exists(config_path):
            raise Exception("Failed to find the config file %s", config_path)
        options.config = config_path

    conf = readconf(options.config)
    # Init logging
    logging.basicConfig(level=conf['logging']['level'],
                        format='%(asctime)s %(levelname)s %(message)s',
                        filename=conf['logging']['filename'], filemode='w')

    local_options = None
    if not options.service:
        local_options = conf['general']
    else:
        local_options = conf['general'].copy()
        local_options.update(conf[options.service])

    # Parse command line config args, override config file if specified
    if options.restargs:
        try:
            cconf = dict(zip(options.restargs[0::2], options.restargs[1::2]))
        except Exception:
            raise Exception("The config is not a key val pair",
                            options.restargs)
        # Check if key are allowed
        for key, value in cconf.iteritems():
            if key not in local_options.keys():
                raise Exception(
                    "Invalid command line parameter \"%s\", allowed parameters are \"%s\""
                    % (key, local_options.keys()))
            local_options[key] = value

    # Main work func here
    print("Start to ingest data to target service {}-{}".format(
        options.product, options.service))
    e = CloudDataMakr(options.product, options.service, **local_options)
    e.gen()
    print("Data ingestion done")

    # Cleanup if necessary
    if options.cleanup:
        e.cleanup()
