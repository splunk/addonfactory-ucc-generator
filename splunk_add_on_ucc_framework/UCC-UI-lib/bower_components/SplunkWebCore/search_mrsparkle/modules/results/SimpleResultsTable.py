# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

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
import lib.i18n as i18n

# logging setup
import logging
logger = logging.getLogger('splunk.appserver.controllers.module.SimpleResultsTable')

import math
import cgi
import decimal

# define standard time field name
TIME_FIELD = '_time'

RAW_FIELD = '_raw'

# define wrapper for rendering multi-value fields
MULTI_VALUE_WRAPPER = '<div class="mv">%s</div>'

# define hard limit for displaying multi-value fields
MAX_MULTI_VALUE_COUNT = 50
MAX_SPARKLINE_MV_COUNT = 101

class SimpleResultsTable(module.ModuleHandler):
    '''
    Provides module content for the SimpleResultsTable.  The arguments supported
    are any params supported by the /splunk/search/jobs/<sid>/results endpoint, i.e.,

    count
    offset
    field_list
    search
    '''

    def generateResults(self, host_app, client_app, sid, count=1000,
            earliest_time=None, latest_time=None, field_list=None,
            offset=0, max_lines=None, reverse_order=0, entity_name='results',
            postprocess=None, display_row_numbers='True', show_preview='0', mark_interactive=None,
            sortField=None, sortDir=None):

        # check inputs
        count = max(int(count), 0)
        offset = max(int(offset), 0)
        display_row_numbers = splunk.util.normalizeBoolean(display_row_numbers)
        if not sid:
            raise Exception('SimpleResultsTable.generateResults - sid not passed!')

        job = splunk.search.JobLite(sid)

        """
        # get job
        try:
            #job = splunk.search.getJob(sid, sessionKey=cherrypy.session['sessionKey'])
        except splunk.ResourceNotFound, e:
            logger.error('SimpleResultsTable could not find the job %s. Exception: %s' % (sid, e))
            return _('<p class="resultStatusMessage">The job appears to have expired or has been canceled. Splunk could not retrieve data for this search.</p>')
        """


        # pass in any field list
        if (field_list) :
            job.setFetchOption(fieldList=field_list, show_empty_fields=False)

        if postprocess:
            job.setFetchOption(search=postprocess)

        if splunk.util.normalizeBoolean(show_preview) and entity_name == 'results':
            entity_name = 'results_preview'

        # set formatting
        job.setFetchOption(
            time_format=cherrypy.config.get('DISPATCH_TIME_FORMAT'),
            earliestTime=earliest_time,
            latestTime=latest_time,
            output_time_format=i18n.ISO8609_MICROTIME
        )

        # build output
        shash = hash(sid)
        output = []
        output.append('<div class="simpleResultsTableWrapper">')
        output.append('<table class="simpleResultsTable splTable table table-striped table-chrome')
        if (mark_interactive) :
            output.append(' enableMouseover')
        output.append('">')

        offset_start = offset

        # these two lines are a noop, since offset=max(0,int(offset)!
        #if offset < 0 and count < abs(offset):
        #    offset_start = -count

        rs = job.getResults(entity_name, offset, count)

        if rs == None:
            return _('<p class="resultStatusMessage">The job appears to have expired or has been canceled. Splunk could not retrieve data for this search.</p>')

        # displayable fields; explicitly pull the _time field into the first column and _raw into the last
        fieldNames = [x for x in rs.fieldOrder() if (not x.startswith('_') or x in (TIME_FIELD, RAW_FIELD) )]
        #fieldNames = [x for x in getattr(job, entity_name).fieldOrder if (not x.startswith('_') or x == TIME_FIELD)]
        try:
            timePos = fieldNames.index(TIME_FIELD)
            fieldNames.pop(timePos)
            fieldNames.insert(0, TIME_FIELD)
        except ValueError:
            pass

        try:
            rawPos = fieldNames.index(RAW_FIELD)
            fieldNames.pop(rawPos)
            fieldNames.append(RAW_FIELD)
        except ValueError:
            pass

        #dataset = getattr(job, entity_name)[offset_start: offset+count]
        dataset = rs.results()

        # the client will request reverse_order=1, when it has determined
        # that we're in the special case of the 'mostly-backwards' sort order of real time search.
        # (we reverse it manually so it appears to the user 'mostly correct'.)
        # (yes, for the pedantic, correct just means "consistent with historical searches, with latest events on page 1")
        #
        # NOTE: the arithmetic of the offset and count with respect to eventAvailableCounts, will
        # already have been done on the client.  This literally just reverses the sort order of
        # the N events we're actually being asked to return.
        if (splunk.util.normalizeBoolean(reverse_order)) :
            dataset.reverse()

        # determine the relative values for heatmapping
        localMin = 0
        localMax = 0
        adjustedMaxDelta = 0
        ordered = []
        for row in dataset:
            if 'TOTAL' not in row.values():
                for fieldName in fieldNames:
                    if fieldName != 'TOTAL':
                        try:
                            ordered.append(float(row[fieldName][0].value))
                        except:
                            pass
        ordered.sort()
        if len(ordered):
            localMin = ordered[0]
            localMax = ordered[-1]

            # bracket min/max to 95th percentile
            adjustedMin, adjustedMax = util.getPercentiles(ordered, .05, .95)
            adjustedMaxDelta = max(abs(adjustedMin), abs(adjustedMax))

            logger.debug('SimpleResultsTable - localMin=%s localMax=%s adjustedMin=%s adjustedMax=%s' % (localMin, localMax, adjustedMin, adjustedMax))

        # generate headers
        output.append('<thead><tr class="">')
        if display_row_numbers:
            output.append('<th class="pos"></th>')

        for field in fieldNames:
            output.append('<th class="sorts %s"><a href="#"><span class="sortLabel">%s</span> <span class="splSort%s"></span></a></th>' \
                % (field != sortField and "None" or sortDir, cgi.escape(field), field != sortField and "None" or sortDir))

        output.append('</tr></thead>')

        # generate data
        for i, result in enumerate(dataset):
            # check for the TOTAL row (not column)
            omitFromHeatmap = False

            for val in result.values():
                for item in val:
                    try:
                        if 'TOTAL' in item.getValue():
                            omitFromHeatmap = True
                            break
                    except:
                        pass


            rowClass = []
            if i % 5 == 4: rowClass.append('s')

            if len(rowClass):
                output.append('<tr class="%s">' % ' '.join(rowClass))
            else:
                output.append('<tr>')

            if display_row_numbers:
                output.append('<td class="pos">%s</td>' % i18n.format_number(i+1+offset))

            for field in fieldNames:
                output.append('<td')


                heatValue = None
                isMaxValue = False
                isMinValue = False
                if not omitFromHeatmap and field != 'TOTAL':
                    v = result.get(field, None)
                    try:
                        v = float(v[0].value)
                        heatValue = min(max(math.ceil(v / adjustedMaxDelta * 1000) / 1000, -1), 1)
                        if v == localMax: isMaxValue = True
                        if v == localMin: isMinValue = True
                    except:
                        pass

                if heatValue != None:
                    output.append(' heat="%s"' % heatValue)
                if isMaxValue:
                    output.append(' isMax="1"')
                if isMinValue:
                    output.append(' isMin="1"')

                if (mark_interactive and (field!="NULL" and field!="OTHER")) :
                    output.append(' class="d" tabindex="0"')


                fieldValues = result.get(field, None)

                # _time is a special case, because:
                #  a) we need to localize the formatting.
                #  b) for drilldown logic we need to pass down epochtime values for
                #     both start and end. These are passed as attributes.
                if field=='_time' and result.time:
                    startTime = splunk.util.dt2epoch(splunk.util.parseISO(str(result.time)))

                    output.append(' startTime="' + str(startTime) + '"')

                    duration = fieldValues = result.get("_span", None)

                    if (duration and duration[0].value != "") :
                        endTime   = startTime + decimal.Decimal(duration[0].value)
                        output.append(' endTime="'   + str(endTime) + '"')

                    output.append('>%s</td>' % i18n.format_datetime_microseconds(result.time))

                elif field==RAW_FIELD and isinstance(fieldValues, splunk.search.RawEvent):
                    output.append(' field="%s">' % cgi.escape(field))
                    output.append(cgi.escape(fieldValues.getRaw()));
                    output.append('</td>')

                # render field values; multi-value as a list
                # cap display count to prevent blowout
                elif fieldValues:
                    output.append(' field="%s">' % cgi.escape(field))

                    if len(fieldValues) > 1 and fieldValues[0].value == "##__SPARKLINE__##":
                        isSparklines = True
                        fieldValues = fieldValues[1:]
                    else:
                        isSparklines = False

                    output.append('<span%s>' % ' class="sparklines"' if isSparklines else '')

                    if isSparklines:
                        renderedValues = [cgi.escape(x.value) for x in fieldValues[:MAX_SPARKLINE_MV_COUNT]]
                    else:
                        renderedValues = [cgi.escape(x.value) for x in fieldValues[:MAX_MULTI_VALUE_COUNT]]

                    if not isSparklines and len(fieldValues) > MAX_MULTI_VALUE_COUNT:
                        clipCount = len(fieldValues) - MAX_MULTI_VALUE_COUNT
                        renderedValues.append(_('[and %d more values]') % clipCount)

                    # when we have multiValued fields we wrap them each in its own div elements
                    if (len(renderedValues) > 1 or isSparklines):
                        multiValueStr = [MULTI_VALUE_WRAPPER % x for x in renderedValues]
                        output.append("".join(multiValueStr))
                    # however for single values the extra div is unwanted.
                    else:
                        output.append("".join(renderedValues))

                    output.append('</span></td>')

                else:
                    output.append('></td>')

            output.append('</tr>')

        output.append('</table></div>')

        if len(dataset) == 0:
            # See SPL-55554 and SPL-55567, the results preview sometimes doesn't report a preview of the results
            # so assume that entity_name == 'results_preview' means we are doing a preview
            if rs.isPreview() or entity_name == 'results_preview':
                output = self.generateStatusMessage(entity_name, 'waiting', sid)
            else:
                output = self.generateStatusMessage(entity_name, 'nodata', sid)
        else:
            output = ''.join(output)

        """
        if ((entity_name == 'events' and job.eventCount == 0)
            or (entity_name == 'results' and job.resultCount == 0)
            or (entity_name == 'results_preview' and job.resultPreviewCount == 0)):

            if job.isDone:

            else:
            """


        return output
