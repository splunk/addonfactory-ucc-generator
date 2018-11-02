import normalize
import logging
import os
from modular_alert_builder.build_core import generate_alerts

class LoggerAdapter(logging.LoggerAdapter):
    def __init__(self, prefix, logger):
        super(LoggerAdapter, self).__init__(logger, {})
        self.prefix = prefix

    def process(self, msg, kwargs):
        return '[%s] %s' % (self.prefix, msg), kwargs

def build(schema_content, product_id, short_name, output_dir):
    # Get the alert schema with required structure
    envs = normalize.normalize(schema_content, product_id, short_name)
    
    # The path to basic file structure required for alerts
    pack_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'arf_dir_templates','modular_alert_package')
    
    # Initializing logger
    logging.basicConfig()
    logger = logging.getLogger('Alert Logger')
    logger = LoggerAdapter('ta="{}" Creating Alerts'.format(short_name),
                           logger)

    # Generate Alerts
    generate_alerts(pack_folder, output_dir, logger, envs)
