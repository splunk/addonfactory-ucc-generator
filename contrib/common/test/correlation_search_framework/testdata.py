import csv
import os
import re
import splunk.search
import splunk.util
import tempfile
import time

from testutil import SearchManager
from testutil import SplunkOneshotInput
from CSVUtil import get_inputcsv_path


class TestData:
    '''
    Base class for handling test data for Correlation Searches.
    
    This class should not be directly instantiated. Instead,
    subclasses of this search should implement a create() method.
    
    An optional _parse_data() method can also be overridden in
    subclasses. This method is used to put the data structure 
    passed in the parameter "data" at initialization time into the
    appropriate format for use by the specific subclass.
    
    There are no restrictions on what can be passed in the "data" 
    parameter - it is up to the subclass to define the data the
    specific test data type requires.
    '''

    TIMEOUT = 30    # The timeout to use for running test data generation in create() methods.
    INTERVAL = 5    # The time to wait between job.isDone checks.
    UUID_PATTERN = '~UUID~'  # A pattern in the test data to replace with a unique identifier.

    def __init__(self, data, namespace, owner, key, offset=None, uuid_override=None, host=None):
        '''
        Initialize the class.
        
        @param data: A dictionary of data used to generate Splunk indexed data.
        @param namespace: The namespace used for executing any populating searches.
        @param owner: The owner used to executing any populating searches.
        @param key: A Splunk session key.
        @param uuid_override: A string to override the automatically-generated UUID with.
        @param offset: An offset in seconds to be subtracted from timestamps in the generated data.
        '''
         
        self._data = data
        self._namespace = namespace
        self._owner = owner
        self._key = key
        self._host = host 

        # Set timestamp for events
        if offset:
            self._ts = time.time() - offset
        else:
            self._ts = time.time()

        self._uuid = uuid_override or splunk.util.uuid4()

        self._parse_data()

    def _parse_data(self):
        pass

    def create(self):
        raise NotImplementedError('This method must be implemented by subclasses of TestData.')


class TsidxTestData(TestData):
    '''
    Class for writing test data to a TSIDX namespace.
    
    TSIDX data collection is very simple; the tscollect command simply needs
    to run after any reporting search with the desired field set.
    '''
    
    def _parse_data(self):

        # Replace fields with the UUID in the base search as needed
        self._populating_search = self._data['populating_search'].replace(self.UUID_PATTERN, self._uuid)

    def create(self):

        print "=== Generating TSIDX test data ==="

        kwargs = {'search': self._populating_search,
            'sessionKey': self._key,
            'namespace': self._namespace,
            'owner': self._owner}

        job = SearchManager.execute(splunk.search.dispatch, **kwargs)

        return self._uuid

    pass


class EventTestData(TestData):
    '''
    Class for writing test events to an index.
    
    The mechanism used to populate the index is:
    1. Define a set of raw event data represented as strings.
    2. Assign a timestamp appropriate for the Correlation Search being tested.
       Sometimes this will involve subtracting an offset to make the events
       fall into the correct time range.
    3. Replace the unique_id_field with a UUID if desired. This field can be 
       used later to identify the Notable Event created in this test. 
    4. Write the events to a file.
    5. Load the file into Splunk via the "oneshot" command.
    
    Following this, the Correlation Search can be tested.
    '''

    def create(self):

        for event, count, regex, sourcetype, source in self._data:

            # Keep count of total events created.
            total = 0

            # Write the data file to a spool directory
            fh = tempfile.NamedTemporaryFile(suffix='.txt', dir=get_inputcsv_path(), delete=False)
            total += count
            for i in xrange(0, count):
		if ("sample.juniper_idp_vuln_scanners" in source):
                    fh.write("%s %s\n" % (time.ctime(self._ts), re.sub(regex, self._uuid, event)))

		elif ("whois.domaintools.sample" in source) or ("sample.sav" in source) or ("df" in source) or ("stream" in source):
                    fh.write(" %s\n" % ( re.sub(regex, self._uuid, event)))
		elif ("auth.nix" in source or "sample.fortinet" in source or 'Linux:CPUTime' in source or 'sample.websense' in source or 'sample.junos_fw' in source or 'sample.dhcpd' in source):
                    fh.write("%s %s\n" % ( time.strftime("%b %d %H:%M:%S ", time.localtime(self._ts)) , re.sub(regex, self._uuid, event)))

		elif ("sample.nessus" in source):
                    fh.write("%s %s\n" % ("start_time="+"\""+time.strftime("%a %b %d %H:%M:%S %Y", time.localtime(self._ts-120))+"\""+"end_time="+"\""+time.strftime("%a %b %d %H:%M:%S %Y", time.localtime(self._ts))+"\"" , re.sub(regex, self._uuid, event)))

		elif ("sample.fs_notification" in source or "sample.oracle11" in source or "OSX:Service" in source or "Linux:Update" in source or "Unix:Uptime" in source or "Unix:SSHDConfig" in source or "Linux:SELinuxConfig" in source):
                    fh.write("%s %s\n" % (time.strftime("%a %b %d %H:%M:%S %Y", time.localtime(self._ts)), re.sub(regex, self._uuid, event)))

		elif ("WinEventLog:Application" in source or "win_listening_ports.bat" in source or "WinEventLog:Security" in source or 'WinEventLog:System' in source):
                    fh.write("%s %s\n" % (time.strftime("%m/%d/%Y %H:%M:%S %p", time.localtime(self._ts)), re.sub(regex, self._uuid, event)))
		elif ("WMI:LocalProcesses" in source or "WMI:Service" in source):
		    fh.write("%s %s\n" % (time.strftime("%Y%m%d%H%M%S", time.localtime(self._ts)), re.sub(regex, self._uuid, event)))
                else:
                    fh.write("%s %s\n" % (time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self._ts)), re.sub(regex, self._uuid, event)))

            fh.close()

            # Submit the events as "oneshot" input.
            oneshot = SplunkOneshotInput(namespace=self._namespace,
                owner=self._owner,
                name=fh.name,
                sessionKey=self._key,
                sourcetype=sourcetype,
                rename_source=source,
		host=self._host)
            
            oneshot.save()

            # Validate that the input has been indexed.
            elapsed = 0
            try:
                oneshotTest = SplunkOneshotInput.get(SplunkOneshotInput.build_id(fh.name, self._namespace, self._owner), sessionKey=self._key)
                while oneshotTest is not None and elapsed <= TestData.TIMEOUT:
                    time.sleep(TestData.INTERVAL)
                    elapsed += TestData.INTERVAL
                    oneshotTest = SplunkOneshotInput.get(SplunkOneshotInput.build_id(fh.name, self._namespace, self._owner), sessionKey=self._key)

            except splunk.ResourceNotFound as e:
                # If the entity no longer exists, assume it has already been indexed.
                pass
            finally:
                #print "  Test events indexed: %d finished after %d seconds." % (total, elapsed)
                #print "  Test data file was: %s" % fh.name
                #print "  Unique ID for this test was %s" % self._uuid
                os.unlink(fh.name)

        return self._uuid


class SummaryTestData(TestData):
    '''Class for writing test data to a summary index.'''
    # NOT YET IMPLEMENTED - will look very similar to TsidxTestData.
    pass


class TrackerTestData(TestData):
    '''
    Class for writing data to a lookup table.
    
    The mechanism used to populate the lookup table is:
    1. Define a set of fields to be included in the lookup table.
    2. Assign a timestamp appropriate for the Correlation Search being tested.
       Sometimes this will involve subtracting an offset to make the events
       fall into the correct time range. Not all lookup tables contain
       timestamp values, however.
    3. Replace any unique_id_field with a UUID if desired. This field can be 
       used later to identify the Notable Event created in this test. 
    4. Write the fields as a CSV to a target file.
    5. Using a search beginning with "|inputcsv", append the CSV
       to the lookup table in question.
       
    Following this, the Correlation Search can be tested.
    '''

    def _parse_data(self):

        self._populating_search = self._data['populating_search']
        self._fields = self._data['fields']

        # Replace fields with the UUID as needed
        newfields = {}
        for k, v in self._fields.iteritems():
            if isinstance(v, basestring) and self.UUID_PATTERN in v:
                newfields[k] = v.replace(self.UUID_PATTERN, self._uuid)
            else:
                newfields[k] = v

        self._fields = newfields

    def create(self):

        fh = tempfile.NamedTemporaryFile(suffix='.csv', dir=os.path.join(os.environ["SPLUNK_HOME"],'var', 'run', 'splunk'), delete=False)
        writer = csv.DictWriter(fh, self._fields.keys())
        writer.writeheader()
        writer.writerow(self._fields)
        fh.close()
        self._populating_search = '| inputcsv %s ' % os.path.basename(fh.name) + self._populating_search

        print "=== Generating lookup table test data ==="

        kwargs = {'search': self._populating_search,
            'sessionKey': self._key,
            'namespace': self._namespace,
            'owner': self._owner}

        job = SearchManager.execute(splunk.search.dispatch, **kwargs)

        print "Test data file was: %s" % fh.name
        os.unlink(fh.name)

        return self._uuid
