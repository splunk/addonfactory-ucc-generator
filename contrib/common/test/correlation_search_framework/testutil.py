import splunk.auth
import time

from splunk.models.base import SplunkAppObjModel
from splunk.models.field import Field


def err(msg):
    print 'ERROR: %s' % msg


class TestDefaults:

    TIMEOUT = 180
    INTERVAL = 5

    def __init__(self):
        pass


class SplunkOneshotInput(SplunkAppObjModel):

    '''Class for Splunk oneshot inputs.'''

    resource = '/data/inputs/oneshot'
    name = Field()
    sourcetype = Field()
    rename_source = Field(api_name='rename-source')
    host = Field()


class SearchManager:

    '''
    Wrapper class for managing search execution.
    '''

    def __init__(self):
        pass

    @classmethod
    def execute(cls, dispatchMethod, **kwargs):
        '''
        Simple wrapper method for executing search with a timeout.

        @param dispatchMethod: The method used to dispatch this search
                               This should be one of splunk.search.dispatch,
                               splunk.saved.dispatchSavedSearch.
        @param kwargs:         Search parameters, passed directly to the
                               dispatch method as a dictionary.
        '''

        search = kwargs.pop('search')
        job = dispatchMethod(search, **kwargs)

        print "  Search string: %s" % search

        if job:
            print "  Dispatched search id: %s" % job.sid

            elapsed = 0
            while not job.isDone and elapsed <= TestDefaults.TIMEOUT:
                time.sleep(TestDefaults.INTERVAL)
                elapsed += TestDefaults.INTERVAL
            print "  Search id: %s finished after %d seconds." % (job.sid, elapsed)

        else:
            print "  Search job did not execute properly: %s" % (search)

        return job or None


class AuthManager:

    '''
    Wrapper class for managing Splunk authentication.
    '''

    DEFAULT_OWNER = 'admin'
    DEFAULT_PASSWORD = 'changeme'

    @classmethod
    def get_credentials(cls, owner=None, password=None):
        '''Return a tuple of (owner, Splunk session key).'''

        try:
            return (owner, splunk.auth.getSessionKey(owner, password))
        except splunk.AuthenticationFailed as e:
            err('Could not obtain Splunk session.')
            raise(e)
        except splunk.AuthorizationFailed as e:
            err('Could not obtain Splunk session.')
            raise(e)
        except Exception as e:
            err('Unknown exception when obtaining Splunk session key.')
            raise(e)

    @classmethod
    def get_default_credentials(cls):
        '''Return default credentials if none are provided.'''
        return (AuthManager.get_credentials(cls.DEFAULT_OWNER, cls.DEFAULT_PASSWORD))
