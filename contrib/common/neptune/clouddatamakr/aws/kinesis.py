import boto3
import time
import traceback
import string
import random
import logging


def is_http_ok(response):
    return response["ResponseMetadata"]["HTTPStatusCode"] in (200, 201)


def http_code(response):
    return response["ResponseMetadata"]["HTTPStatusCode"]


class KinesisEventGen(object):
    LATEST = "LATEST"
    TRIM_HORIZON = "TRIM_HORIZON"
    AFTER_SEQUENCE_NUMBER = "AFTER_SEQUENCE_NUMBER"
    AT_SEQUENCE_NUMBER = "AT_SEQUENCE_NUMBER"

    def __init__(self, logger=None, **config):
        """
        :config: dict object
        {
        "region": xxx,
        "key_id": aws key id,
        "secret_key": aws secret key,
        "stream_name": stream_name,
        "shard_id": shard_id,
        "sequence_number": xxx,
        "shard_iterator_type":\
        'AT_SEQUENCE_NUMBER'|'AFTER_SEQUENCE_NUMBER'|'TRIM_HORIZON'|'LATEST'
        "event_number": kinesis event number
        "use_gzip": True|False
        "use_vpcflow": True|False
        }
        """

        self._config = config
        if 'event_number' in self._config:
            self._config['event_number'] = int(self._config['event_number'])
        self._client = boto3.client("kinesis",
                                    region_name=config["region"],
                                    aws_access_key_id=config["key_id"],
                                    aws_secret_access_key=config["secret_key"])
        self.logger = logger if logger else logging.getLogger()

    def gen(self):

        if self._config['stream_name'] not in self.list_streams():
            self.create_stream()

        if self._config['use_vpcflow']:
            event = '2 063605715280 eni-c4237b9c 194.177.12.219 172.31.15.211 \
            53 31834 17 1 74 1436342284 1436342308 REJECT OK'

        else:
            event = 'dummy string event' + \
                    ''.join(random.choice(string.ascii_lowercase +
                                          string.digits) for _ in range(10))

        events = [event for i in xrange(self._config['event_number'])]
        self.put_records(events)

    def cleanup(self):
        self.delete_stream()

    def delete_stream(self):
        response = self._client.delete_stream(
            StreamName=self._config['stream_name'])
        if not is_http_ok(response):
            msg = "Failed to delete Kinesis streams, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

    def create_stream(self):
        response = self._client.create_stream(
            StreamName=self._config['stream_name'],
            ShardCount=self._config['shard_count'])
        if not is_http_ok(response):
            msg = "Failed to create Kinesis streams, errorcode={}".format(
                http_code(response))
            self.logger.error(msg)
            raise Exception(msg)
        self.logger.info("Wait for 60s for stream to be ready")
        time.sleep(60)

    def list_streams(self):
        """
        :return: a list of stream names in this region
        """

        stream_names = []
        params = {"Limit": 20}
        while 1:
            response = self._client.list_streams(**params)
            if not is_http_ok(response):
                msg = "Failed to list Kinesis streams, errorcode={}".format(
                    http_code(response))
                self.logger.error(msg)
                raise Exception(msg)

            stream_names.extend(response.get("StreamNames", []))
            if response.get("HasHasMoreStreams"):
                params["ExclusiveStartStreamName"] = stream_names[-1]
            else:
                break

        return stream_names

    def describe_streams(self, stream_names=None):
        """
        :param stream_names: a list of stream names, if None, describe all
        streams
        :return: a dict of dict, each dict contains
        {
        'StreamName': 'string',
        'StreamARN': 'string',
        'StreamStatus': 'CREATING'|'DELETING'|'ACTIVE'|'UPDATING',
        'Shards': [
             {
                 'ShardId': 'string',
                 'ParentShardId': 'string',
                 'AdjacentParentShardId': 'string',
                 'HashKeyRange': {
                     'StartingHashKey': 'string',
                     'EndingHashKey': 'string'
                 },
                 'SequenceNumberRange': {
                     'StartingSequenceNumber': 'string',
                     'EndingSequenceNumber': 'string'
                 }
             },...]
        }
        """

        if stream_names is None:
            stream_names = self.list_streams()

        streams = {}
        for stream_name in stream_names:
            response = self._client.describe_stream(StreamName=stream_name)

            if not is_http_ok(response):
                msg = "Failed to describe Kinesis stream=%s,\
                errorcode={}".format(stream_name, http_code(response))
                self.logger.error(msg)
                raise Exception(msg)

            if not response.get("StreamDescription"):
                continue

            streams[stream_name] = response["StreamDescription"]
        return streams

    def put_records(self, events):
        """
        :params events: a list of strings
        :return: a list of error events
        {
        "ErrorCode": xxx,
        "ErrorMessage": xxx,
        "Data": xxx,
        }
        """

        now = str(time.time())
        records = [{"Data": event, "PartitionKey": now} for event in events]

        response = self._client.put_records(
            Records=records,
            StreamName=self._config["stream_name"])

        if not is_http_ok(response):
            msg = "Failed to put records in stream=%s, errorcode={}".format(
                self._config["stream_name"], http_code(response))
            self.logger.error(msg)
            raise Exception(msg)

        error_events = []
        for i, record in enumerate(response["Records"]):
            if record.get("ErrorCode"):
                error_events.append({
                    "ErrorCode": record["ErrorCode"],
                    "ErrorMessage": record["ErrorMessage"],
                    "Data": events[i],
                })
        return error_events

    def get_records(self):
        """
        :return: a generator which generates a list of records in the format of
        {
        "Data": raw payload,
        "ApproximateArrivalTimestamp": datetime object,
        "SequenceNumber": seq number,
        "PartitionKey": partition key
        }
        """

        encoding = self._config.get("encoding")
        shard_iter = self.get_shard_iterator()
        while 1:
            try:
                response = self._client.get_records(ShardIterator=shard_iter)
            except Exception as e:
                self.logger.error(
                    "Failed to get records from stream=%s, shard_id=%s, "
                    "error=%s", self._config["stream_name"],
                    self._config["shard_id"], traceback.format_exc())

                if "ExpiredIteratorException" in e.message:
                    shard_iter = self.get_shard_iterator()
                elif "ProvisionedThroughputExceeded" in e.message:
                    time.sleep(3)
                elif "ResourceNotFoundException" in e.message:
                    self.logger.info(
                        "stream_name=%s in region=%s has been deleted, done "
                        "with data collection for this stream",
                        self._config["stream_name"], self._config["region"])
                    raise StopIteration()

                time.sleep(2)
                continue

            if not is_http_ok(response):
                self.logger.error(
                    "Failed to get records from stream=%s, shard_id=%s, "
                    "errorcode=%s", self._config["stream_name"],
                    self._config["shard_id"], http_code[response])
                time.sleep(2)
                continue

            shard_iter = response.get("NextShardIterator")
            if not shard_iter:
                self.logger.info("Done with stream=%s, shard_id=%s",
                                 self._config["stream_name"],
                                 self._config["shard_id"])
                raise StopIteration()

            records = response.get("Records")
            if not records:
                yield records
                time.sleep(2)
                continue

            for rec in records:
                if encoding == "gzip":
                    from StringIO import StringIO
                    from gzip import GzipFile
                    gzf = GzipFile(fileobj=StringIO(rec["Data"]))
                    try:
                        rec["Data"] = gzf.read()
                    except IOError:
                        pass

                        # data = rec["Data"].decode("utf-8", errors="ignore")
                        # rec["Data"] = data.encode("utf-8")

            self._config["sequence_number"] = records[-1]["SequenceNumber"]
            yield records
            time.sleep(0.5)

    def get_shard_iterator(self):
        iter_type = self._config["shard_iterator_type"]
        if (iter_type not in (self.LATEST, self.TRIM_HORIZON) and
                not self._config.get("sequence_number")):
            self._config["sequence_number"] = self._get_init_sequence_number()

        params = {}
        kk = {
            "stream_name": "StreamName",
            "shard_id": "ShardId",
            "sequence_number": "StartingSequenceNumber",
            "shard_iterator_type": "ShardIteratorType",
        }

        for key, k in kk.iteritems():
            if self._config.get(key):
                params[k] = self._config[key]

        if self._config.get("sequence_number"):
            params["ShardIteratorType"] = self.AFTER_SEQUENCE_NUMBER

        response = self._client.get_shard_iterator(**params)
        if not is_http_ok(response):
            msg = ("Failed to get shard iterator for stream=%s, shard_id=%s, "
                   "errorcode=%s").format(self._config["stream_name"],
                                          self._config["shard_id"],
                                          http_code(response))
            self.logger.error(msg)
            raise Exception(msg)
        return response["ShardIterator"]

    def _get_init_sequence_number(self):
        streams = self.describe_streams([self._config["stream_name"]])
        for shard in streams[self._config["stream_name"]]["Shards"]:
            if shard["ShardId"] == self._config["shard_id"]:
                return shard["SequenceNumberRange"]["StartingSequenceNumber"]
        else:
            msg = ("Failed to get sequence number for stream_name={}, "
                   "shard_id=%s").format(self._config["stream_name"],
                                         self._config["shard_id"])
            self.logger.error(msg)
            raise Exception(msg)
