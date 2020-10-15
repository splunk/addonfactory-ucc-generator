# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

import logging, splunk.util, time, json
import controllers.module as module

from splunk.appserver.mrsparkle.lib import i18n
logger = logging.getLogger('splunk.modules.TimeRangePicker')

class TimeRangePicker(module.ModuleHandler):
    

    
    
    def generateResults(self, host_app, client_app, **args):
        '''
        you can give it any arg,  and it will attempt to parse that arg as a string date+time in ISO format. 
        returns a JSON dictionary with fooEpochTime, and fooOffset keys, for each foo given.
        typical input is  earliest=2009-02-24T06%3A00%3A00.z&latest=2009-08-24T06%3A00%3A01.z
        output for which is a json dict containing earliestEpochTime,  earliestOffset,  latestEpochTime, latestOffset.
        '''
        
        params = {}

        # probably could be done with a list comprehension but then you wouldnt get to understand it.
        for argName in ["earliest", "latest"] :
            if (argName in args.keys()) :
                dt = splunk.util.parseISO(args[argName])
                params[argName + "EpochTime"] =   str(splunk.util.dt2epoch(dt))

                # client is built to work with offset in minutes.  unfortunately timedelta instances do not have a 'minutes' property.
                # and for some reason datetime returns them differently and im being careful here to keep offset integers consistent with elsewhere.

                # FOR SOME INSANE REASON THIS ENDS UP BEING JSON'ed AS A ONE ELEMENT LIST.   
                # properties of timedelta instances... looks like an int, talks like an int, JSONable's like a duck.  Python ftl.
                params[argName + "Offset"]    =  dt.utcoffset().seconds / 60 - 1440,
        
        return json.dumps(params)