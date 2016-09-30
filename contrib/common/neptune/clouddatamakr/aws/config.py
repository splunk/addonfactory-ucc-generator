import os
import tempfile
import gzip
import boto.sqs
import json
import boto.sqs.jsonmessage
import boto.s3.connection
import boto.exception
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class ConfigEventGen(object):
    def __init__(self,
                 region=None,
                 key_id=None,
                 secret_key=None,
                 proxy=None,
                 is_secure=True,
                 queue=None,
                 sample=None,
                 s3_sample=None,
                 s3_region=None,
                 event_number=1,
                 notification_number=1):

        self.region = region
        self.queue_name = queue
        self.sqs_queue = None
        self.event_number = int(event_number)
        self.notification_number = int(notification_number)

        if not s3_region:
            self.s3_region = region

        current_folder = os.path.dirname(os.path.abspath(__file__))
        sample_folder = os.path.join(current_folder, 'samples/config_sample')

        if sample:
            self.sample_file = os.path.join(sample_folder, sample)
        else:
            self.sample_file = os.path.join(sample_folder, 'MESSAGE_CONFIG.txt')

        if s3_sample:
            self.s3_sample_file = os.path.join(sample_folder, s3_sample)
        else:
            self.s3_sample_file = os.path.join(sample_folder, 'aws_config_s3.sample')

        # Init global conn
        self.sqs_conn = self.__connect_sqs(region, key_id, secret_key, proxy,
                                           is_secure)
        self.s3_conn = self.__connect_s3(region, key_id, secret_key, proxy,
                                         is_secure)

        self.cleanup_queue = []

    def gen(self):
        self.put_messages()

    def cleanup(self):
        for q in self.cleanup_queue:
            logger.debug("Deleting queue now... %s", q)
            self.sqs_conn.delete_queue(q)

    def get_connection(self):
        return self.sqs_conn

    def create_queue(self, name):
        q = self.sqs_conn.create_queue(name)
        self.cleanup_queue.append(q)
        return q

    def get_queue(self):
        self.sqs_queue = self.sqs_conn.get_queue(self.queue_name)
        if not self.sqs_queue:
            self.sqs_queue = self.create_queue(self.queue_name)

    def get_messages(self, num_messages=10, time_out=20, source_queue=None):
        if source_queue is None:
            if self.sqs_queue is None:
                self.get_queue()
        else:
            self.sqs_queue = source_queue

        self.sqs_queue.set_message_class(boto.sqs.message.RawMessage)

        # num_messages=10 was chosen based on aws pricing faq.
        # see request batch pricing: http://aws.amazon.com/sqs/pricing/
        notifications = self.sqs_queue.get_messages(
            num_messages=num_messages,
            visibility_timeout=time_out,
            wait_time_seconds=time_out)

        # Aaron for test
        dest_file = open(self.sample_file, 'wb')

        index = 0
        for msg in notifications:

            try:
                json.loads(msg.get_body())
            except Exception as e:
                logger.info("problems decoding notification JSON string:\
                {} {}".format(
                    type(e).__name__, e))
                continue

            dest_file.write(json.dumps(
                json.loads(msg.get_body()),
                sort_keys=False,
                ensure_ascii=False))
            dest_file.write("\n")
            index += 1

        logger.info("Get queue done, %d msg has been read", index)

    # Fill s3 bucket if not exists
    def fill_s3_bucket(self, bucket_name=None, key_name=None):
        if bucket_name and key_name:
            logger.debug("Filling s3 bucket \"%s\", key \"%s\" with file %s",
                         bucket_name, key_name, self.sample_file)
            try:
                bucket = self.s3_conn.get_bucket(bucket_name, validate=True)
            except boto.exception.S3ResponseError as e:
                if e.status == 404:
                    logger.debug("Failed to find bucket_name %s,\
                    creating.. %s", bucket_name)
                    bucket = self.s3_conn.create_bucket(
                        bucket_name, location=self.s3_region)
                else:
                    raise

            sf = open(self.s3_sample_file)
            tf = tempfile.NamedTemporaryFile()
            cnt_hash = {}
            cnt_hash['Records'] = []
            for i in xrange(self.event_number):
                cnt = sf.readline()
                if cnt == '':
                    sf.seek(0, 0)
                    cnt = sf.readline()
                cnt_hash['Records'].append(json.loads(cnt))
            with gzip.open(tf.name, 'wb') as f:
                f.write(json.dumps(cnt_hash,
                                   sort_keys=False,
                                   ensure_ascii=False))
            key = bucket.new_key(key_name)
            key.set_contents_from_filename(tf.name)
            logger.debug("Writing %s event to file %s done", self.event_number,
                         tf.name)
            tf.close

    # Pushes a message onto the queue
    def put_messages(self):
        for index in xrange(self.notification_number):
            with open(self.sample_file) as f:
                data = f.read()
                # output = data['Message']
                #
                # s3_bucket_name = (output['s3Bucket'] if
                #                   's3Bucket' in output else None)
                # s3_key_name = (output['s3ObjectKey'] if
                #                's3ObjectKey' in output else None)

                # Fixme: not fill s3 bucket now
                #self.fill_s3_bucket(s3_bucket_name, s3_key_name)

                # Connect to SQS and open the queue
                if self.sqs_queue is None:
                    self.get_queue()

                # Put the message in the queue
                logger.debug("Ingest message to queue = %s %s",
                             self.queue_name, self.sqs_queue)
                m = boto.sqs.message.RawMessage()
                m.set_body(data)
                self.sqs_queue.write(m)

                index += 1
                if index >= self.notification_number:
                    logger.debug(
                        "Put sqs done, %d message has been uploaded",
                        index)
                    return

        # Still not ever be here
        logger.error("Put messages failed!")

    def save_message_to_file(self, source_queue=None):
        if source_queue is None:
            if self.sqs_queue is None:
                self.get_queue()
        else:
            self.sqs_queue == source_queue

        number = self.sqs_queue.save(self.sample_file)
        logger.debug("successfully load %s events from %s", number,
                     self.get_queue())

    def load_message_from_file(self):
        if self.sqs_queue is None:
            self.get_queue()

        number = self.sqs_queue.load(self.sample_file)
        logger.debug("successfully dump %s events to sqs %s", number,
                     self.sqs_queue())

    def __connect_sqs(self, region, key_id, secret_key, proxy, is_secure=True):
        if not proxy:
            sqs_conn = boto.sqs.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                is_secure=is_secure)
            return sqs_conn
        else:
            proxy_host = proxy['host']
            proxy_port = proxy['port']
            proxy_username = proxy['user']
            proxy_password = proxy['pass']

            if proxy_host is None:
                return None

            sqs_conn = boto.sqs.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                proxy=proxy_host,
                proxy_port=proxy_port,
                proxy_user=proxy_username,
                proxy_pass=proxy_password,
                is_secure=is_secure)
        if sqs_conn is not None:
            return sqs_conn

    def __connect_s3(self, region, key_id, secret_key, proxy, is_secure=True):

        if not proxy:
            logger.debug("Create s3 conn with region %s", region)

            s3_conn = boto.s3.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                is_secure=is_secure)
            return s3_conn
        else:
            proxy_host = proxy['host']
            proxy_port = proxy['port']
            proxy_username = proxy['user']
            proxy_password = proxy['pass']

            if proxy_host is None:
                return None

            s3_conn = boto.s3.connect_to_region(
                region,
                aws_access_key_id=key_id,
                aws_secret_access_key=secret_key,
                proxy=proxy_host,
                proxy_port=proxy_port,
                proxy_user=proxy_username,
                proxy_pass=proxy_password,
                is_secure=is_secure)
        if s3_conn is not None:
            return s3_conn


if __name__ == "__main__":

    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("-s", "--src", type="string", dest="src_sqs")
    parser.add_option("-d", "--dst", type="string", dest="dest_sqs")
    parser.add_option("--sqs_sample", type='string', dest="sqs_sample")
    parser.add_option("--s3_sample", type='string', dest="s3_sample")
    parser.add_option("--event_number", type='int', dest="event_number")
    parser.add_option("--msg_number", type='int', dest="msg_number")
    (options, args) = parser.parse_args()

    # Source Config
    configgen = ConfigEventGen(region='us-east-1',
                               key_id='dummy',
                               secret_key='dummy',
                               sample=options.sqs_sample,
                               s3_sample=options.s3_sample,
                               event_number=options.event_number,
                               notification_number=options.msg_number)
    configgen.gen()
