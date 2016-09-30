import json

import splunklib.client as client
import splunktalib.conf_manager.ta_conf_manager as tcm
import splunktalib.credentials as cred

if __name__ == '__main__':

    with open('test/performance/testcase.json') as json_data:
        test_case = json.load(json_data)

    service = client.connect(host='localhost', port=8089, username='admin', password='changeme')

    output_file = open('perf_results.json', 'w')

    addon_name = test_case['addon_name']

    for i in range(10):
        for test_case_name, test_case_spl in test_case.items():
            if test_case_name == 'addon_name':
                continue

            print '[{}] Run test case: {}'.format(addon_name, test_case_spl)

            job = service.search(test_case_spl, **{'exec_mode': 'blocking', 'adhoc_search_level': 'smart'})

            test_result = job['performance'].copy()
            test_result['addon_enable'] = 'True'
            test_result['test_case'] = test_case_name
            test_result['spl'] = test_case_spl

            for indicator in ['eventCount', 'eventFieldCount', 'resultCount', 'runDuration', 'scanCount']:
                test_result[indicator] = job[indicator]

            json.dump(test_result, output_file)
            output_file.write('\n')

    print 'Disabling addon {}'.format(addon_name)

    session_key = cred.CredentialManager.get_session_key("admin", "changeme")
    mgr = tcm.TAConfManager("app.conf", "https://localhost:8089", session_key, test_case['addon_name'])
    mgr.update({"name": "install", "state": "disabled"})
    service.restart(timeout=600)

    for i in range(10):
        for test_case_name, test_case_spl in test_case.items():
            if test_case_name == 'addon_name':
                continue

            print '[{}] Run test case: {}'.format(addon_name, test_case_spl)

            job = service.search(test_case_spl, **{'exec_mode': 'blocking', 'adhoc_search_level': 'smart'})

            test_result = job['performance'].copy()
            test_result['addon_enable'] = 'False'
            test_result['test_case'] = test_case_name
            test_result['spl'] = test_case_spl

            for indicator in ['eventCount', 'eventFieldCount', 'resultCount', 'runDuration', 'scanCount']:
                test_result[indicator] = job[indicator]

            json.dump(test_result, output_file)
            output_file.write('\n')

    output_file.close()
    service.stop()
