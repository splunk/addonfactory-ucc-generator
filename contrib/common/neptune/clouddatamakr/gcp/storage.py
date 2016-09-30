import httplib2
import random
import time
import os
from gcp_data_makr_common import get_credential

from oauth2client.service_account import ServiceAccountCredentials
import googleapiclient as gac
import googleapiclient.discovery
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError


NUM_RETRIES = 5
RETRYABLE_ERRORS = (httplib2.HttpLib2Error, IOError)


def handle_progressless_iter(error, progressless_iters):
    if progressless_iters > NUM_RETRIES:
        print 'Failed to make progress for too many consecutive iterations.'
        raise error

    sleeptime = random.random() * (2 ** progressless_iters)
    print ('Caught exception (%s). Sleeping for %s seconds before retry #%d.'
           % (str(error), sleeptime, progressless_iters))
    time.sleep(sleeptime)


class StorageEventGen(object):
    CHUNK_SIZE = 2 * 1024 * 1024

    def __init__(self, credential=None, bucket=None, sample_file=None, target_name=None):
        """
        :param credential: dict, str
        :param bucket: str, bucket name
        :param sample_file: str, local file path
        :param target_name: str, target file name
        """
        self.dic_credential = get_credential(credential)

        self.bucket = bucket
        self.target_name = target_name

        current_folder = os.path.dirname(os.path.abspath(__file__))
        sample_folder = os.path.join(current_folder, 'samples')

        if sample_file:
            self.sample_file = os.path.join(sample_folder, sample_file)
        else:
            self.sample_file = os.path.join(sample_folder, 'splunk-gcp-2016-07-06.csv')

        self.sac_crediential = ServiceAccountCredentials.from_json_keyfile_dict(self.dic_credential)
        self.srv = gac.discovery.build('storage', 'v1', credentials=self.sac_crediential)
        self.srv_objects = self.srv.objects()

    def gen(self):
        media = MediaFileUpload(self.sample_file, chunksize=self.CHUNK_SIZE, resumable=True)
        request = self.srv_objects.insert(bucket=self.bucket, name=self.target_name,
                                          media_body=media)
        progressless_iters = 0
        response = None
        while response is None:
            error = None
            try:
                progress, response = request.next_chunk()
                if progress:
                    pass
            except HttpError, err:
                error = err
                if err.resp.status < 500:
                    raise
            except RETRYABLE_ERRORS, err:
                error = err

            if error:
                progressless_iters += 1
                handle_progressless_iter(error, progressless_iters)
            else:
                progressless_iters = 0

    def cleanup(self):
        self.srv_objects.delete(bucket=self.bucket, object=self.target_name).execute()