import os
import logging
import random
import time
import re
import boto.logs
import boto.kinesis
import json
import sys
from sets import Set
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../'))
from lib.utils import to_bool, gen_random_string



class CloudwatchlogsEventGen(object):
    def __init__(self,
                 region=None,
                 key_id=None,
                 secret_key=None,
                 group_name=None,
                 stream_name=None,
                 proxy=None,
                 is_secure=True,
                 prev_ts=None,
                 token=None,
                 account_id=None,
                 number=None,
                 group_number=1,
                 stream_number=1,
                 event_number=1,
                 random_name=False,
                 use_kinesis=False,
                 kinesis_stream_name=None,
                 kinesis_partition_key=None,
                 kinesis_shard_number=None):
        self.cwlogs_conn = self.__connect_cloudwatch_logs(
            region, key_id, secret_key, proxy, is_secure)
        if use_kinesis:
            self.kinesis_conn = self.__connect_kinesis(
                region, key_id, secret_key, proxy, is_secure)
        self.prev_ts = prev_ts
        self.token = token
        self.region = region
        self.group_name = group_name
        self.stream_name = stream_name
        self.event_number = int(event_number)
        self.group_number = int(group_number)
        self.stream_number = int(stream_number)
        self.random_name = to_bool(random_name)
        self.group_sets = Set()
        self.use_kinesis = use_kinesis
        self.kinesis_stream_name = kinesis_stream_name
        self.kinesis_partition_key = kinesis_partition_key
        self.kinesis_shard_number = kinesis_shard_number

    def gen(self):

        for i in xrange(self.group_number):
            group_name = self.group_name
            if not self.random_name:
                if self.group_number > 1:
                    group_name = self.group_name + '_' + str(
                        i)  # Add suffix if mulitple log group
            else:
                group_name += gen_random_string(
                    10)  # Add 10 random string suffix if needed
            for j in xrange(self.stream_number):
                stream_name = self.stream_name
                if not self.random_name:
                    if self.stream_number > 1:
                        stream_name = self.stream_name + '_' + str(
                            j)  # Add suffix if mulitple log stream
                else:
                    stream_name += gen_random_string(
                        10)  # Add 10 random string suffix if needed

                # Create log events
                logger.debug(
                    "Start creating %d event...log group=%s, log stream=%s",
                    self.event_number, group_name, stream_name)
                self.create_cloudwatch_log_events(
                    group_name,
                    stream_name,
                    events_num=self.event_number)
                self.group_sets.add(group_name)
                logger.debug(
                    "End creating %d event...log group=%s, log stream=%s",
                    self.event_number, group_name, stream_name)

    def cleanup(self):
        for g in self.group_sets:
            self.clean_cloudwatch_log_events(g)
            logger.debug("Clean up log groups %s done.", g)

    def get_connection(self):
        return self.cwlogs_conn

    def clean_cloudwatch_log_events(self, group_name, stream_name=None):
        """ Delete all the events in specified group name
            All the sub log streams will be deleted as well
        """
        try:
            if stream_name:
                self.cwlogs_conn.delete_log_stream(group_name, stream_name)
            else:
                self.cwlogs_conn.delete_log_group(group_name)
        except boto.logs.exceptions.ResourceNotFoundException as e:
            pass
        except Exception as e:
            logger.error(
                "Failed to clean up log group %s and stream %s, error message = %s",
                group_name, stream_name, e)

    def clean_cloudwatch_log_groups_byprefix(self, group_prefix):
        """ Delete all the events in specified group prefix
        All the sub log streams will be deleted as well
        """
        response = self.cwlogs_conn.describe_log_groups(
            log_group_name_prefix=group_prefix)
        for group_name in response['logGroups']:
            response = self.cwlogs_conn.delete_log_group(group_name[
                'logGroupName'])

    def create_cloudwatch_log_events(self,
                                     group_name,
                                     stream_name,
                                     events_num=1,
                                     new_token=None,
                                     interval=None):
        """ Sample cloudwatch logs as below
        {u'ingestionTime': 1436342344790, u'timestamp': 1436342284000,
        u'message': u'2 063605715280 eni-c4237b9c 194.177.12.219 172.31.15.211
        53 31834 17 1 74 1436342284 1436342308 REJECT OK'}
        """

        # Create cwlog group if not exists
        try:
            response = self.cwlogs_conn.describe_log_groups(
                log_group_name_prefix=group_name)
            if not response['logGroups']:
                self.cwlogs_conn.create_log_group(group_name)
        except boto.logs.exceptions.ResourceNotFoundException:
            self.cwlogs_conn.create_log_group(group_name)

        # Create cwlog stream if not exists
        try:
            response = self.cwlogs_conn.describe_log_streams(
                log_group_name=group_name,
                log_stream_name_prefix=stream_name)
            if not response['logStreams'] or stream_name not in [
                    d['logStreamName'] for d in response['logStreams']
            ]:
                self.cwlogs_conn.create_log_stream(group_name, stream_name)
        except boto.logs.exceptions.ResourceNotFoundException:
            self.cwlogs_conn.create_log_stream(group_name, stream_name)

        events_list = []
        total_num = events_num
        batch_num = 500
        while total_num:
            logger.debug("stream {}, {} events left".format(stream_name,
                                                            total_num))
            curr_num = total_num - batch_num > 0 and batch_num or total_num
            events_list = []
            for _ in xrange(curr_num):
                message = self.__gen_random_cloudwatch_event(
                    stream_name=stream_name)
                ingestion_time = int(time.time())
                delta = interval or random.randint(0, 2)
                # Backoff 15min
                event_time = self.prev_ts and self.prev_ts + delta or int(
                    time.time() - 15 * 60)
                self.prev_ts = event_time
                event_log = {'ingestionTime': ingestion_time * 1000,
                             'timestamp': event_time * 1000,
                             'message': message}
                events_list.append(event_log)
            if self.use_kinesis:
                self.put_kinesis_events(events_list)
            else:
                self.put_cloudwatch_log_events(group_name, stream_name,
                                               events_list, self.token)
            total_num -= curr_num

    def put_kinesis_events(self, events_list):
        kinesis_events_list = []
        for event in events_list:
            record = {'Data': json.dumps(event),
                      'PartitionKey': str(hash(time.time()))}
            kinesis_events_list.append(record)
        response = self.kinesis_conn.put_records(kinesis_events_list,
                                                 self.kinesis_stream_name)
        logger.debug("response = %s", response)

        # # Try to get records after put
        # shard_id = 'shardId-000000000000'
        # shard_it = self.kinesis_conn.get_shard_iterator(self.kinesis_stream_name, shard_id, "LATEST")["ShardIterator"]
        # out = self.kinesis_conn.get_records(shard_it, limit=500)
        # logger.info("get records result = %s", out)

    def put_cloudwatch_log_events(self, group_name, stream_name, events_list,
                                  token):

        retry_times = 3
        while retry_times > 0:
            try:
                response = self.cwlogs_conn.put_log_events(group_name, stream_name,
                                                           events_list, token)
                self.token = response['nextSequenceToken']
                return
            except Exception as e:
                print e.message, token
                retry_times -= 1
                if "Rate exceeded" in e.message:
                    error_message = 'sleep 2sec as hit limit'
                    print error_message
                    logger.error(error_message)
                    time.sleep(2)
                    continue
                else:
                    pattern = re.compile(
                        '.*?The next expected sequenceToken is: (\w+).*?')
                    match = pattern.match(str(e.message))
                    if not match:
                        import traceback
                        print "***********trackback message is************"
                        print e.message
                        print group_name, stream_name
                        traceback.print_exc()
                        break
                    expected_token = match.groups()[0]
                    if expected_token:
                        token = expected_token if expected_token != 'null' else None
                        continue

        raise RuntimeError('Create failed')

    def get_cloudwatch_log_events(self, group_name, stream_name, start_time,
                                  end_time):
        events = []
        buf = self.cwlogs_conn.get_log_events(group_name,
                                              stream_name,
                                              start_time=start_time,
                                              end_time=end_time, )
        while 'events' in buf and buf['events']:
            events.extend(buf['events'])
            buf = self.cwlogs_conn.get_log_events(
                group_name,
                stream_name,
                start_time=start_time,
                end_time=end_time,
                next_token=buf['nextBackwardToken'])
        return events

    def __connect_cloudwatch_logs(
            self, region,
            key_id, secret_key,
            proxy, is_secure=True):
        if not proxy:
            cwlogs_conn = boto.logs.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                is_secure=is_secure)
        else:
            proxy_host = proxy['host']
            proxy_port = proxy['port']
            proxy_username = proxy['user']
            proxy_password = proxy['pass']

            if proxy_host is None:
                return None

            cwlogs_conn = boto.logs.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                proxy=proxy_host,
                proxy_port=proxy_port,
                proxy_user=proxy_username,
                proxy_pass=proxy_password,
                is_secure=is_secure)
        if cwlogs_conn is not None:
            return cwlogs_conn
        else:
            raise Exception("Failed to create cloudwatchlogs connection!")

    def __connect_kinesis(
            self, region,
            key_id, secret_key,
            proxy, is_secure=True):
        if not proxy:
            kinesis_conn = boto.kinesis.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                is_secure=is_secure)
        else:
            proxy_host = proxy['host']
            proxy_port = proxy['port']
            proxy_username = proxy['user']
            proxy_password = proxy['pass']

            if proxy_host is None:
                return None

            kinesis_conn = boto.kinesis.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                proxy=proxy_host,
                proxy_port=proxy_port,
                proxy_user=proxy_username,
                proxy_pass=proxy_password,
                is_secure=is_secure)
        if kinesis_conn is not None:
            return kinesis_conn
        else:
            raise Exception("Failed to create kinesis connection!")

    def __gen_random_cloudwatch_event(
            self,
            version=2,
            account_id='063605715280',
            interface_id=None,
            stream_name=None,
            port_range=65535,
            protocol_range=255,
            packet_range=10000,
            bytes_range=100000,
            start_time=int(time.time()) - random.randint(3600, 7200),
            end_time=int(time.time()) - random.randint(0, 3600)):
        def __get_next_random_ip():
            while True:
                yield '.'.join('%s' % random.randint(0, 255) for i in range(4))

        version = version
        account_id = account_id
        interface_id = stream_name and stream_name.rstrip(
            '-all') or 'eni-randomid-1-all'
        srcaddr = __get_next_random_ip().next()
        destaddr = __get_next_random_ip().next()
        srcport = random.randint(1, port_range)
        dstport = random.randint(1, port_range)
        protocol = random.randint(0, protocol_range)
        packets = random.randint(0, packet_range)
        pbytes = random.randint(0, bytes_range)
        start = start_time
        end = end_time
        action = random.choice(['ACCEPT', 'REJECT'])
        logstatus = random.randint(1, 1000) % 1000 == 0 and random.choice(
            ['NODATA', 'SKIPDATA']) or "OK"  # 1/1000 chance to
        fields_list = [version, account_id, interface_id, srcaddr, destaddr,
                       srcport, dstport, protocol, packets, pbytes, start, end,
                       action, logstatus]
        message = ' '.join([str(x) for x in fields_list])
        return message


if __name__ == "__main__":

    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("-t",
                      "--timestamp",
                      action="store",
                      type="int",
                      default=None,
                      dest="last_time")
    parser.add_option("-n", "--number", type="int", default=1, dest="log_num")
    parser.add_option("-c",
                      "--cleanup",
                      action="store_false",
                      dest="clean_flag")
    parser.add_option("-r",
                      "--region",
                      type='string',
                      dest="region",
                      default='eu-west-1')
    parser.add_option("--group-name",
                      default='auto_group_name1',
                      dest="group_name")
    parser.add_option("--stream-name",
                      default='auto_stream_name1',
                      dest="stream_name")
    parser.add_option("--kinesis-stream-name",
                      default=None,
                      dest="kinesis_stream_name")
    parser.add_option("--kinesis-shard-number",
                      default=3,
                      dest="kinesis_shard_number")

    (options, args) = parser.parse_args()

    # azhang for testing
    logger.setLevel(logging.DEBUG)

    aws_region = os.environ['AWS_ACCOUNT_REGION']
    aws_key_id = os.environ['AWS_ACCOUNT_ACCESS_KEY']
    aws_secret_id = os.environ['AWS_ACCOUNT_SECRET_KEY']
    auto_group_name = options.group_name
    auto_stream_name = options.stream_name
    use_kinesis = True if options.kinesis_stream_name else False

    cwlogs_obj = CloudwatchlogsEventGen(
        aws_region,
        aws_key_id,
        aws_secret_id,
        use_kinesis=use_kinesis,
        kinesis_stream_name=options.kinesis_stream_name,
        kinesis_shard_number=options.kinesis_shard_number,
        kinesis_partition_key='partitionkey')

    cwlogs_obj.create_cloudwatch_log_events(auto_group_name,
                                            auto_stream_name,
                                            events_num=options.log_num)

    # Clean up
    if options.clean_flag:
        result = cwlogs_obj.get_connection().cwlogs_conn.delete_log_stream(
            auto_group_name, auto_stream_name)
        result = cwlogs_obj.get_connection().cwlogs_conn.delete_log_group(
            auto_group_name)
