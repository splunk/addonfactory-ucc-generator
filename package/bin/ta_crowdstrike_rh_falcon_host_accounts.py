import os
import sys
import splunk.admin as admin
LIB_FOLDER_NAME = 'splunk_ta_crowdstrike'
folder_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(folder_path, LIB_FOLDER_NAME))
from splunktaucclib.rest_handler import base, normaliser
from splunktalib.common import util

util.remove_http_proxy_env_vars()


class Servers(base.BaseModel):
    """REST Endpoint of Server in Splunk Add-on UI Framework.
    """
    rest_prefix = 'ta_crowdstrike'
    endpoint = "configs/conf-crowdstrike_falcon_host_accounts"
    requiredArgs = {'api_uuid', 'api_key', 'endpoint'}
    encryptedArgs = {'api_key'}
    cap4endpoint = ''
    cap4get_cred = ''


if __name__ == "__main__":
    admin.init(base.ResourceHandler(Servers), admin.CONTEXT_APP_AND_USER)
