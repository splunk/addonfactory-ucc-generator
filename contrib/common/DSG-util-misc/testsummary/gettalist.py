#########This function is used to get the ta-name from https://confluence.splunk.com/display/SHAN/TA+Status+Overview

import requests
import sys
import json
import re

def get_confluence_ta_status_overview(username,password):
    page_id = "32855457"  ####This is the page_id for https://confluence.splunk.com/display/SHAN/TA+Status+Overview
    confluence_url = "https://confluence.splunk.com"
    username_password = (username,password)
    confluence_tso_rest_url = confluence_url +"/rest/api/content/"+page_id+ "?expand=body.storage"
    try:
        confluence_tso_r = requests.get(confluence_tso_rest_url, auth=username_password)
        if confluence_tso_r.status_code is 200:
            confluence_tso_rjson = json.loads(confluence_tso_r._content)
            confluence_tso_rjson_value = confluence_tso_rjson['body']['storage']['value']
            ta_name_rule = re.compile('>(ta\-.*?)<')
            ta_name_list = ta_name_rule.findall(confluence_tso_rjson_value)
            return ta_name_list

        else:
            print "Unable to access the confluence page, http status_code is: "+confluence_tso_r.status_code
            sys.exit(1)

    except Exception as error_message:
        print error_message