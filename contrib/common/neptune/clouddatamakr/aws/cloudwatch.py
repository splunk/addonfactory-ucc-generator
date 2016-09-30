import boto3
import logging
import json
import copy
from datetime import datetime, timedelta
import random


def is_http_ok(response):
    return response["ResponseMetadata"]["HTTPStatusCode"] in (200, 201)


def http_code(response):
    return response["ResponseMetadata"]["HTTPStatusCode"]


class CloudwatchEventGen(object):
    def __init__(self,
                 region,
                 key_id,
                 secret_key,
                 namespace,
                 dimensions,
                 metricdata=None,
                 metric_data_number=20,
                 metric_data_interval=60,
                 metric_names='TestCount',
                 event_number=1,
                 logger=None,
                 ):

        event_number = int(event_number)

        self._client = boto3.client("cloudwatch",
                                    region_name=region,
                                    aws_access_key_id=key_id,
                                    aws_secret_access_key=secret_key)
        self._config = {
            'event_number': event_number,
            'namespace': namespace,
            'metricdata': metricdata,
            'dimensions': dimensions,
            'metric_data_number': int(metric_data_number),
            'metric_data_interval': int(metric_data_interval),
            'metric_names': metric_names,

        }
        self.logger = logger if logger else logging.getLogger()

    def gen(self):
        for i in xrange(self._config['event_number']):
            self.put_metric()

    def cleanup(self):
        pass

    def generate_metricdata(self, dimensions, metric_names, metric_data_number, metric_data_interval):
        metricdata = []
        now = datetime.utcnow()
        dim_dict = json.loads(dimensions)[0]
        for key, value in dim_dict.iteritems():
            metricdata_model = {
                'Value': 5,
                'MetricName': metric_names,
                'Dimensions': ({'Name': key, 'Value': value},),
            }

            for time_before in range(metric_data_number):
                now_before = now - timedelta(seconds=metric_data_interval * time_before)
                timestamp = (now_before - datetime(1970, 1, 1)).total_seconds()
                metricdata_model.update({
                    'Value': random.randint(1, 100),
                    'Timestamp': timestamp,
                })
                metricdata.append(copy.copy(metricdata_model))
        return metricdata


    def put_metric(self):
        if not self._config['metricdata']:
            self._config['metricdata'] = self.generate_metricdata(
                self._config['dimensions'],
                self._config['metric_names'],
                self._config['metric_data_number'],
                self._config['metric_data_interval'],
            )

        response = self._client.put_metric_data(
            Namespace=self._config['namespace'],
            MetricData=self._config['metricdata'])
        if not is_http_ok(response):
            msg = "Failed to put Cloudwatch metric, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

    def list_metrics(self):
        """
        :return: a list of metrics of given namespace and dimension
        """
        metric_list = []
        params = {"Namespace": self._config['namespace'],
                  "Dimensions": self._config['dimensions']}

        response = self._client.list_metrics(**params)
        if not is_http_ok(response):
            msg = "Failed to list Cloudwatch metrics, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

        metric_list = list(set([m['MetricName']
                                for m in response.get('Metrics', [])]))
        return metric_list

    def list_dimensions(self):
        """
        :return: a list of metrics of given namespace and dimension
        """
        dimensions_list = []
        params = {"Namespace": self._config['namespace']}

        response = self._client.list_metrics(**params)
        if not is_http_ok(response):
            msg = "Failed to list Cloudwatch dimensions, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

        dimensions_list = list(set([m['Dimensions'][0]['Value']
                                    for m in response.get('Metrics', [])]))
        return dimensions_list

    def list_namespace(self):
        """
        :return: a list of metrics of given namespace and dimension
        """
        namespace_list = []
        params = {}

        response = self._client.list_metrics(**params)
        if not is_http_ok(response):
            msg = "Failed to list Cloudwatch namespace, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

        namespace_list = list(set([m['Namespace']
                                   for m in response.get('Metrics', [])]))
        return namespace_list
