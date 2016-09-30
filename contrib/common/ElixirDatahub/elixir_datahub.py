#!/usr/bin/env python

import os
import pprint

from walkdir import filtered_walk, file_paths

from datahub.casesuites import CaseSuites
from datahub.event import Event
from datahub.splunk import Splunk
from datahub.bamboo import Bamboo

def main():
    # collect cases data
    junit_files = file_paths(filtered_walk('test', included_files=['*pytest-results.xml']))
    junit_files = [os.path.abspath(junit_file) for junit_file in junit_files]
    casesuites  = CaseSuites(junit_files)
    cases_data  = casesuites.junit2json()
    # pprint.pprint(cases_data)

    # collect bamboo data
    bamboo = Bamboo()
    bamboo_data = bamboo.collect_data()
    if not bamboo_data:
        print "this script need run in bamboo runtime context"
        exit(1)
    # pprint.pprint(bamboo_data)

    # generate splunk events
    event = Event(bamboo_data, cases_data)
    event_list = event.gen_events()
    # pprint.pprint(event_list)

    # submit events to splunk
    splunk = Splunk(event_list)
    splunk.commit()

if __name__ == '__main__':
    main()

