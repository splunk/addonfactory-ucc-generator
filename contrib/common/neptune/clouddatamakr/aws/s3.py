import os
import shutil
import tempfile
import boto.s3
import boto.exception
import logging
import fnmatch
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../'))
from lib.utils import to_bool
from lib.utils import get_data_from_file

logger = logging.getLogger(__name__)


class S3EventGen(object):
    def __init__(self,
                 region=None,
                 key_id=None,
                 secret_key=None,
                 proxy=None,
                 is_secure=True,
                 s3_bucket=None,
                 s3_key=None,
                 s3_key_prefix=None,
                 s3_key_number=None,
                 sample=None,
                 event_number=1,
                 append_on_exist=True,
                 archive_type=None,
                 storage_class='STANDARD',
                 encrypted=False):
        self.s3_conn = self.__connect_s3(region, key_id, secret_key, proxy,
                                         to_bool(is_secure))
        self.region = region
        self.s3_bucket = s3_bucket
        self.s3_key = s3_key
        self.s3_key_prefix = s3_key_prefix
        self.s3_key_number = int(s3_key_number) if s3_key_number else None
        self.event_number = int(event_number)
        self.append_on_exist = to_bool(append_on_exist)
        self.archive_type = archive_type
        self.storage_class = storage_class
        self.encrypted = encrypted

        sample_folder = self.get_sample_path()

        if sample:
            self.sample_file = os.path.join(sample_folder, sample)
        else:
            self.sample_file = os.path.join(sample_folder, 'aws_s3.sample')

    def get_connection(self):
        return self.s3_conn

    def cleanup(self, clean_bucket=True):
        logger.debug("Deleting s3 bucket.. %s", self.s3_bucket)
        try:
            bucket = self.s3_conn.get_bucket(self.s3_bucket, validate=False)
            bucket.delete_key(self.s3_key)
            if clean_bucket:
                self.s3_conn.delete_bucket(self.s3_bucket)
        except Exception as e:
            logger.error("Failed to cleanup bucket %s, error message = %s",
                         self.s3_bucket, e)

    def gen(self):
        if self.s3_key_prefix:
            if self.s3_key_number and self.s3_key_number > 1:
                s3_key_list = [
                    self.s3_key_prefix + '/' + self.s3_key + '_' + str(id)
                    for id in xrange(self.s3_key_number)
                ]
                if self.archive_type:
                    s3_key_list = [key + '.' + self.archive_type
                                   for key in s3_key_list]
                map(self.create_s3_file, s3_key_list)
            else:
                self.create_s3_file(self.s3_key_prefix + '/' + self.s3_key)
        else:
            self.create_s3_file(self.s3_key)

    def create_s3_file(self, filename):
        self.create_s3_log_events(self.s3_bucket, filename, self.event_number,
                                  self.sample_file, self.append_on_exist,
                                  self.archive_type)

    def create_events_file(self,
                           events_num,
                           sample_file=None,
                           archive_type=None):
        sf = open(sample_file)
        tmpdir = tempfile.mkdtemp()
        tf = tempfile.NamedTemporaryFile(delete=False, dir=tmpdir)
        logger.debug("create %s events in tmp file is %s", events_num, tf.name)
        cnt = next(get_data_from_file(sf,
                                      events_num,
                                      replace_ts=True,
                                      ts_pattern=
                                      "\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}"))
        tf.write(cnt)
        tf.close()

        if archive_type is None:
            return tf.name
        try:
            atf = shutil.make_archive(
                os.path.basename(tf.name), archive_type,
                os.path.dirname(tf.name))
        except Exception:
            logger.error("Failed to make archive with type %s, \
            valid option is 'zip', 'tar', 'bztar' or 'gztar'", archive_type)
            raise
        shutil.rmtree(tmpdir)
        return atf

    def create_s3_log_events(self,
                             bucket_name,
                             key_name,
                             events_num=1,
                             sample_file=None,
                             append_on_exist=True,
                             archive_type=None):

        logger.debug("Create %d events in s3 bucket %s,\
            key %s with sample file %s and archive type %s", events_num,
                     bucket_name, key_name, sample_file, archive_type)
        try:
            bucket = self.s3_conn.get_bucket(bucket_name, validate=True)
        except boto.exception.S3ResponseError as e:
            if e.status == 404:
                logger.debug("Failed to find bucket_name %s, creating..",
                             bucket_name)
                bucket = self.s3_conn.create_bucket(bucket_name,
                                                    location=self.region)
            else:
                raise Exception("Failed to in get_bucket: %s", e)

        # Tmp file to store sample data
        archive_file = self.create_events_file(events_num, sample_file,
                                               archive_type)
        # Bucket exists
        try:
            key_exists = bucket.get_key(key_name)
        except boto.exception.S3ResponseError as e:
            logger.debug("Failed to find key %s", key_name)
            key_exists = None

        if key_exists and append_on_exist:
            logger.debug("Found key %s already exists", key_exists)
            logger.debug("Append %s events into key %s", events_num, key_name)
        else:
            logger.debug("Create key %s and append events into it", key_name)
            key_exists = bucket.new_key(key_name)

        if self.storage_class != 'STANDARD':
            logger.debug("Changing the storage type of key %s to %s", key_name,
                         self.storage_class)
            key_exists.change_storage_class(self.storage_class)

        key_exists.set_contents_from_filename(archive_file,
                                              encrypt_key=self.encrypted)

        os.remove(archive_file)
        return

    def __connect_s3(self, region, key_id, secret_key, proxy, is_secure=True):
        if not proxy:
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
        else:
            raise ("Failed to create s3 conn!")

    @classmethod
    def get_sample_path(cls):
        current_folder = os.path.dirname(os.path.abspath(__file__))
        sample_folder = os.path.join(current_folder, 'samples/s3_sample')
        return sample_folder


def find_sample(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result


if __name__ == "__main__":
    """ Examples:
    1. Generate 100 logs to bucket s3autotestazhang with file name as test.log
    python s3.py --sample ../samples/aws_s3.sample -n 100 -b s3autotestazhang -k test.log --aws_key <yourkey> --aws_secret <yoursec>
    
    2. Generate 1000 logs to bucket s3autotestazhang with file name as test.zip 
    python s3.py --sample ../samples/aws_s3.sample -n 100 -b s3autotestazhang -a zip -k test.zip --aws_key <yourkey> --aws_secret <yoursec>

    3. Generate 1000 logs to bucket s3autotestazhang with file name as test.tar 
    python s3.py --sample ../samples/aws_s3.sample -n 100 -b s3autotestazhang -a tar -k test.tar --aws_key <yourkey> --aws_secret <yoursec>

    4. Generate 1000 logs to bucket s3autotestazhang with file name as test.gzip 
    python s3.py --sample ../samples/aws_s3.sample -n 100 -b s3autotestazhang -a gztar -k test.gzip --aws_key <yourkey> --aws_secret <yoursec>
    """

    from optparse import OptionParser
    parser = OptionParser()
    parser.add_option("-f", "--sample", type='string', dest="samplefile")
    parser.add_option("-n", "--number", type='int', dest="eventnumber")
    parser.add_option("-k", "--key", type='string', dest="s3key")
    parser.add_option("-b", "--bucket", type='string', dest="s3bucket")
    parser.add_option("-a", "--archive", type='string', dest="archivetype")
    parser.add_option("--aws_key", type='string', dest="aws_key")
    parser.add_option("--aws_secret", type='string', dest="aws_secret")
    parser.add_option("--region",
                      type='string',
                      dest="region",
                      default='eu-west-1')
    (options, args) = parser.parse_args()

    s3_gen = S3EventGen(options.region,
                        options.aws_key,
                        options.aws_secret,
                        sample=options.samplefile,
                        event_number=options.eventnumber,
                        s3_bucket=options.s3bucket,
                        s3_key=options.s3key,
                        archive_type=options.archivetype)
    s3_gen.gen()
