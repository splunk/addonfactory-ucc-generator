#! /usr/bin/env python

import os
import sys
LIB_FOLDER_NAME = 'splunk_ta_crowdstrike'
SCHEMA_FILE_NAME = 'falcon_host.schema.json'
try:
    from splunktaucclib.data_collection import ta_mod_input
    from falcon_host_stream_api import consume
    from falcon_host_data_client import FalconHostDataClient
except ImportError:
    folder_path = os.path.dirname(os.path.realpath(__file__))
    sys.path.append(os.path.join(folder_path, LIB_FOLDER_NAME))
    from splunktaucclib.data_collection import ta_mod_input
    from falcon_host_stream_api import consume
    from falcon_host_data_client import FalconHostDataClient


def ta_run():
    segments = [os.path.dirname(os.path.abspath(__file__)), LIB_FOLDER_NAME, SCHEMA_FILE_NAME]
    schema_file_path = os.path.join(*segments)
    ta_mod_input.main(FalconHostDataClient, schema_file_path, "falcon_host_api")


if __name__ == '__main__':
    ta_run()
