import json

import yaml

from halimede.result_processor import _result_aggregator
from halimede.result_processor._result_sendor import SplunkResultServer
from halimede.result_processor.result_template import SummaryResult, ResultJSONEncoder
from halimede.test_executor._test_scenario import TestScenario
from halimede.test_generator.app import App
import logging
import uuid

logging.basicConfig(filename='halimede.log')
logger = logging.getLogger(__name__)
# handler = logging.StreamHandler()
# handler.setFormatter(logging.Formatter('%(asctime)s %(message)s'))
# logger.addHandler(handler)
_LOG_FORMAT = '[%(asctime)s] %(levelname)s - %(name)s: %(message)s'
_DATE_FORMAT = '%Y-%m-%d %H:%M:%S.%f'
handler = logging.FileHandler(filename='halimede.log', mode="w")
handler.setFormatter(logging.Formatter(_LOG_FORMAT))
level = logging.INFO
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)


if __name__ == '__main__':
    config = yaml.load(open('config.yaml'))
    test_config = config['test']
    app_config = config['app']
    result_config = config['result']
    resource_config = config['resource']
    searches_config = config['searches']
    product_config = config['product']
    uuid = uuid.uuid4().hex

    app = App(app_config['url'], app_config['password'], app_config['app_name'], app_config['app_version'], True)
    dashboards = app.dashboards
    realtimesplunk = SplunkResultServer(host='10.66.130.125', hec_token='318D09DD-C101-4B53-912D-1B5B9809B0C5', x_splunk_request_channel='FE0ECFAD-13D5-401B-847D-77833BD77131')
    test = TestScenario(uuid=uuid,
                        concurrency=test_config['concurrency'],
                        iteration=test_config['iterations'],
                        think_time=test_config['think_time'],
                        config=app_config,
                        app=app,
                        # searches=app.global_searches[dashboards[0]],
                        realtime=result_config['realtime2splk'],
                        splunk=realtimesplunk,
                        resource_config=resource_config,
                        searches_config=searches_config)

    summary_result_placeholder = SummaryResult(uuid=uuid,
                                               test_name=test_config['name_prefix']+'-'+app_config['app_name']+'-'+app_config['app_version'],
                                               status='running',
                                               product_config=product_config,
                                               unit=result_config["unit"])
    splunk = SplunkResultServer(host='10.66.130.125', hec_token='E2D4FB80-2C84-42D9-954E-7AA967F036CC', x_splunk_request_channel='FE0ECFAD-13D5-401B-847D-77833BD77131')
    splunk.receive(str(json.dumps(summary_result_placeholder.toJSON(), cls=ResultJSONEncoder)))

    # savedsearch_metrics = {}
    # savedsearch_metrics = test.start_saved_search_test()
    test.start_dashboard_test()
    print test.detail_result

    # raw summary data
    summary = _result_aggregator._aggregate(test.detail_result)
    print summary
    _result_aggregator._print_summary(summary)

    # formatted summary data
    summary_result = SummaryResult(uuid=uuid,
                                   test_name=test_config['name_prefix']+'-'+app_config['app_name']+'-'+app_config['app_version'],
                                   status='pass',
                                   product_config = product_config,
                                   unit=result_config["unit"],
                                   summary_result=summary,
                                   resource_metrics=test.resource_metrics,
                                   extra_metrics=None)
    print json.dumps(summary_result.toJSON(), cls=ResultJSONEncoder)

    # Send out the result to splunk result server
    splunk.receive(str(json.dumps(summary_result.toJSON(), cls=ResultJSONEncoder)))
