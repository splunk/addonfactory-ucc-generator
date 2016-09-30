import os
import sys
import splunk.admin as admin
LIB_FOLDER_NAME = 'splunk_ta_crowdstrike'
folder_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(folder_path, LIB_FOLDER_NAME))
from splunktaucclib.rest_handler import base, validator
from splunktalib.common import util


util.remove_http_proxy_env_vars()
_APP_ID_MAX_LEN = 10


class Input(base.BaseModel):
    rest_prefix = 'ta_crowdstrike'
    endpoint = "configs/conf-crowdstrike_falcon_host_inputs"
    requiredArgs = {'index', 'interval', 'account'}
    optionalArgs = {'start_offset', 'app_id'}
    validators = {'app_id', validator.String(maxLen=_APP_ID_MAX_LEN)}
    cap4endpoint = ''
    cap4get_cred = ''


if __name__ == "__main__":
    admin.init(base.ResourceHandler(Input), admin.CONTEXT_APP_AND_USER)
