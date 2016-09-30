from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
import functools
import requests
import splunk.auth as auth
import sys

app_info = '{"app": "Splunk_TA_ForIndexers", "label": "Splunk App For Indexers", "version": "1.0.0", "build": "0"}'
include_indexes = True
imported_apps_only = True
namespace = 'SplunkEnterpriseSecuritySuite'
session_key = auth.getSessionKey('admin', 'changeme')
spl_location = make_splunkhome_path(['etc', 'apps', 'SA-Utils', 'local', 'data', 'appmaker'])


def make_ta_for_indexers():
    '''
    Splunk_TA_ForIndexers spl generation for ES 4.2.0 and up
    '''
    sys.path.append(make_splunkhome_path(['etc', 'apps', 'SA-Utils', 'bin']))
    from app_maker.make_index_time_properties import makeIndexTimeProperties

    archive = makeIndexTimeProperties(app_info, session_key, include_indexes=include_indexes,
                                      imported_apps_only=imported_apps_only, namespace=namespace)
    assert archive.startswith(spl_location)


def make_ta_for_indexers_old():
    '''
    Splunk_TA_ForIndexers spl generation for ES 4.0.0 to 4.1.x
    '''
    sys.path.append(make_splunkhome_path(['etc', 'apps', 'SA-Utils', 'appserver', 'controllers']))
    from appmaker import AppMaker

    create_fn = functools.partial(AppMaker.makeIndexTimeProperties, include_indexes=include_indexes,
                                  imported_apps_only=imported_apps_only, namespace=namespace)
    archive = AppMaker.makeApp(app_info, create_fn, session_key)
    assert archive.startswith(spl_location)

# Retrieving ES version via REST to determine method of TA generation
r = requests.get('https://localhost:8089/services/apps/local/SplunkEnterpriseSecuritySuite?output_mode=json',
                 auth=('admin', 'changeme'), verify=False)
if r.status_code != 200:
    r.raise_for_status()
version = r.json()['entry'][0]['content']['version']

if version < '4.2.0':
    make_ta_for_indexers_old()
else:
    make_ta_for_indexers()
