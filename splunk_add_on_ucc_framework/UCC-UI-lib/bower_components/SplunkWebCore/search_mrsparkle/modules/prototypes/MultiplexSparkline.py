#
# Splunk UI module python renderer
# This module is imported by the module loader (lib.module.ModuleMapper) into
# the splunk.appserver.mrsparkle.controllers.module.* namespace.
#

# required imports
import cherrypy
import controllers.module as module

# common imports
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util

# logging setup
import logging
logger = logging.getLogger('splunk.appserver.controllers.module.MultiplexSparkline')


class MultiplexSparkline(module.ModuleHandler):
    '''
    Returns a multirow sparkline display based on timecharts.  The datapoints passed into
    the HTML document are all normalized on a -100 to 100 integer range
    '''

    def generateResults(self, **args):

        logger.debug('MultiplexSparkline.generateResults - args=%s' % args)
        
        # assert input
        sid = args.get('sid', None)
        if not sid:
            raise Exception('MultiplexSparkline.generateResults - sid not passed!')
            
        # get job
        try:
            job = splunk.search.getJob(sid, sessionKey=cherrypy.session['sessionKey'])
        except splunk.ResourceNotFound:
            return 'job sid=%s not found' % sid

        count = int(args.get('count', 1000))
        offset = int(args.get('offset', 0))
        
        # pass in any field list
        fieldList = args.get('field_list', None)
        if isinstance(fieldList, list):
            job.setFetchOption(fieldList=args['field_list'])
        elif isinstance(fieldList, str):
            job.setFetchOption(fieldList=[args['field_list']])
        

        displayFields = [x for x in job.results.fieldOrder if not x.startswith('_')]

        # get data once
        dataBuffer = []
        for row in job.results[offset : offset+count]:
            dataBuffer.append(row)

        # get data min/max
        ordered = []
        localMin = 0
        localMax = 0
        for field in displayFields:
            for row in dataBuffer:
                try:
                    ordered.append(float(row[field][0].value))
                except:
                    pass
        ordered.sort()
        if len(ordered):
            localMin = ordered[0]
            localMax = ordered[-1]
        localMaxDelta = max(abs(localMin), abs(localMax))
        
        relativeMin = 0
        relativeMax = 0
        try:
            relativeMin = int(localMin/ localMaxDelta * 100)
            relativeMax = int(localMax/ localMaxDelta * 100)
        except:
            pass
        
        # build output
        output = ['<table class="sparklineSet" s:min="%s" s:max="%s">' % (relativeMin, relativeMax)]

        for field in displayFields:

            series = []
            for row in dataBuffer:
                try:
                    value = float(row[field][0].value)
                except:
                    value = 0
                
                if localMaxDelta == 0:
                    relativeValue = 0
                else:
                    relativeValue = value / localMaxDelta
                series.append(str(int(relativeValue * 100)))

            output.append('<tr>')
            output.append('<td>%s</td>' % field)
            output.append('<td><span class="sparklines">%s</span></td>' % ','.join(series))
            output.append('</tr>')

        output.append('</table>')
        
        return ''.join(output)
