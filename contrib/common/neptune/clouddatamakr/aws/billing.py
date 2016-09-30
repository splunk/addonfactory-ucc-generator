import os
import random
import re
import boto.s3
import boto.exception
import csv
import fnmatch
import zipfile
import logging
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../'))
from lib.utils import to_bool

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class BillingEventGen(object):
    def __init__(self,
                 region,
                 key_id,
                 secret_key,
                 proxy=None,
                 is_secure=True,
                 s3_bucket=None,
                 sample_folder=None,
                 month=None,
                 year=None,
                 report_type=1,
                 random_cost=False):
        self.s3_conn = self.__connect_s3(region, key_id, secret_key, proxy,
                                         is_secure)

        self.region = region
        self.replaced_file = None
        self.s3_bucket = s3_bucket
        self.month = month
        self.year = year

        if sample_folder:
            self.sample_folder = sample_folder
        else:
            current_folder = os.path.dirname(os.path.abspath(__file__))
            self.sample_folder = os.path.join(current_folder, 'samples/billing_sample')

        # report_type defination:
        # 0 = Monthly report
        # 1 = Monthly cost allocation report
        # 2 = Detailed billing report
        # 3 = Detailed billing report with resources and tags
        # Default = 1 as Saas App use it for billing dashboard
        self.change_report_type(report_type)
        self.random_cost = to_bool(random_cost)

    def change_report_type(self, report_type):
        self.report_type = int(report_type)
        self.sample = self.get_sample_file(self.report_type,
                                           self.sample_folder)

    def gen(self):
        for m in self.month.split(','):
            tmp_sample = self.randomize_sample(self.sample, self.report_type,
                                               m, self.year, self.random_cost)
            self.upload_to_s3(tmp_sample, self.report_type)
            # Delete temp sample after uploading
            os.remove(tmp_sample)

    def cleanup(self, clean_bucket=True):
        logger.debug("Deleting s3 bucket.. %s", self.s3_bucket)
        try:
            bucket = self.s3_conn.get_bucket(self.s3_bucket, validate=False)
            rs = bucket.list()
            for key in rs:
                bucket.delete_key(key)
            if clean_bucket:
                self.s3_conn.delete_bucket(self.s3_bucket)
        except Exception as e:
            logger.error("Failed to cleanup bucket %s, error message = %s",
                         self.s3_bucket, e)

    def get_connection(self):
        return self.s3_conn

    def get_sample_file(self, report_type, sample_folder):
        logger.debug("get a random billing sample file")
        file_match_list = [
            "\d+-aws-billing-csv-\d{4}-\d{2}\.csv",
            "\d+-aws-cost-allocation-\d{4}-\d{2}\.csv",
            "\d+-aws-billing-detailed-line-items-\d{4}-\d{2}\.csv",
            "\d+-aws-billing-detailed-line-items-with-resources-and-tags-\d{4}-\d{2}\.csv"
        ]

        file_match = file_match_list[report_type]
        sample_match_list = [f
                             for f in os.listdir(sample_folder)
                             if re.match(file_match, f)]
        if not sample_match_list:
            raise Exception(
                "Failed to find any match sample data for report_type " + str(
                    report_type))
        sample = random.choice(sample_match_list)
        logger.debug("Using file %s as sample data" % sample)
        return os.path.join(sample_folder, sample)

    def randomize_sample(self,
                         sample=None,
                         report_type=None,
                         month_replace=None,
                         year_replace=None,
                         random_cost=None):

        replace_date = str(year_replace) + '/' + str(month_replace)
        date_pattern = re.compile('\d{4}[-/]\d{2}')

        temp_sample = sample + '.temp'
        temp_sample = re.sub(date_pattern, '-'.join(replace_date.split('/')),
                             temp_sample)

        destfile = open(temp_sample, 'wb')
        writer = csv.writer(destfile,
                            skipinitialspace=True,
                            delimiter=',',
                            quotechar='"')

        with open(sample, 'rb') as sourcefile:
            reader = csv.reader(sourcefile,
                                skipinitialspace=True,
                                delimiter=',',
                                quotechar='"')
            random_factor = round(random.uniform(0.2, 4.0), 1)
            index = 1
            date_pattern = re.compile('\d{4}[-/]\d{2}')
            for row in reader:
                if len(row) <= 3:
                    logger.warn("Invalid row %s, skipping...", row)
                    continue
                for i in xrange(len(row)):
                    row[i] = re.sub(date_pattern, replace_date, row[i])
                # FIXME: random the cost
                writer.writerow(row)
        logger.debug("temp sampe = %s", temp_sample)
        return temp_sample

    def random_cost(self, row, columns, float_format, random_factor):
        for (cl, fm) in zip(columns, float_format):
            row[cl] = float_format.format(random_factor * float(row[cl]))
        return row

    def zip(self, src):
        dir_name = os.path.dirname(src)
        current_dir_name = os.getcwd()
        src_without_temp = re.sub('.temp', '', src)
        dst = src_without_temp + '.zip'
        from shutil import copyfile
        copyfile(src, src_without_temp)
        base_name = os.path.basename(src_without_temp)

        zf = zipfile.ZipFile(dst, "w")
        os.chdir(dir_name)
        zf.write(base_name)
        zf.close()
        os.chdir(current_dir_name)
        os.remove(src_without_temp)
        return dst

    def upload_to_s3(self, filepath=None, report_type=None):
        filename = os.path.basename(filepath)
        if report_type == 2 or report_type == 3:
            s3path = re.sub('.temp', '.zip', filename)
            filepath = self.zip(filepath)
        else:
            s3path = re.sub('.temp', '', filename)
        try:
            bucket = self.s3_conn.get_bucket(self.s3_bucket, validate=True)
        except boto.exception.S3ResponseError as e:
            if e.status == 404:
                logger.debug("Failed to find bucket_name %s, creating..",
                             self.s3_bucket)
                bucket = self.s3_conn.create_bucket(self.s3_bucket,
                                                    location=self.region)
        from boto.s3.key import Key
        k = Key(bucket)
        k.key = s3path
        k.set_contents_from_filename(filepath)
        if report_type == 2 or report_type == 3:
            os.remove(filepath)
        logger.debug("Billing data generated in s3 bucket %s done.",
                     self.s3_bucket)

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


def find_sample(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result


if __name__ == "__main__":
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option("-m", "--month", type="string", dest="month")
    parser.add_option("-f", "--sample", type='string', dest="sample_path")

    (options, args) = parser.parse_args()

    # Common test purpose
    env_obj = BillingEventGen('eu-west-1',
                              'dummy',
                              'dummy',
                              s3_bucket='azhang-test-billing-auto',
                              month=options.month)

    env_obj.gen()
