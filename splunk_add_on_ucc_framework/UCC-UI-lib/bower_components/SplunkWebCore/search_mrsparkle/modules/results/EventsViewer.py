import cherrypy, logging, datetime, math, os, splunk.search, splunk.util
import controllers.module as module
from splunk.appserver.mrsparkle.lib import i18n, util
from splunk.appserver.mrsparkle.lib import eventrenderer
import cgi
import json
import copy
from splunk.appserver.mrsparkle.lib import routes
from decimal import *

logger = logging.getLogger('splunk.modules.events_viewer')

MAX_EVENTS_CONSTRAINT = 100 # Browser crash control
MAX_LINES_CONSTRAINT_DEFAULT = 500 # Browser crash control (currently set to backend limit)
MIN_LINES_CONSTRAINT = 5
TRUNCATION_MODE_DEFAULT = "abstract"
SEGMENTATION_DEFAULT = "none"
HTML_TEMPLATE = "results/EventsViewer_generate_results.html"

def printjson(o, indent, level, expanded_nodes, qs):

    newindent = indent + 2
    retval = []
    if isinstance(o, dict) or isinstance(o, list):
        is_dict = isinstance(o, dict)
        retval.append(is_dict and '{' or '[')

        if len(o) and is_dict:
            if indent != 0 and level not in expanded_nodes:
                expanded_nodes_copy = copy.copy(expanded_nodes)
                expanded_nodes_copy.append(level)
                qs['expanded_nodes'] = expanded_nodes_copy

                retval.append('<a href="%s" class="showinline">[+]</a>}' % (routes.make_route("/module", host_app='system', module='Splunk.Module.EventsViewer', action='render', _qs=qs)))
                return retval
            else:
                retval.append('<a class="jsexpand">[-]</a>')
                retval.append('<span style="display: inline;">')

        first = True
        if is_dict:
            l = o.keys()
            l.sort()
        else:
            l = o
            retval.append('<span class="Array">')

        for i in l:
            if not first:
                retval.append(',')
            else:
                first = False
            retval.append('\n')
            retval.append(' '*newindent)
            if is_dict:
                retval.append('<span class="Prop">')
                retval.append('<span class="PropName">')
                retval.append(cgi.escape(i))
                retval.append('</span>')
                retval.append(" : ")
                retval.extend(printjson(o[i], newindent, level + "." + i, expanded_nodes, qs))
                retval.append('</span>')
            else:
                retval.extend(printjson(i, newindent, level, expanded_nodes, qs))

        if not is_dict:
            retval.append('</span>')

        if not first:
            retval.append('\n' + ' '*indent)
        if len(o) and is_dict:
            retval.append('</span>')
        retval.append(is_dict and '}' or ']')
    elif o is True:
        return ['<span class="Bool t path" >true</span>']
    elif o is False:
        return ['<span class="Bool t path">false</span>']
    elif o is None:
        return ['<span class="Null t path">null</span>']
    elif isinstance(o, (int, long)):
        return ['<span class="Num t path">', str(o), '</span>']
    else:
        return ['"<span class="Str t path">', cgi.escape(str(o)), '</span>"']
   
    return retval

class EventsViewer(module.ModuleHandler):

    def generateResults(self, host_app, client_app, sid, count=10, display_row_numbers=1, enable_event_actions=1, 
                        enable_field_actions=1, earliest_time=None, has_layout=1, latest_time=None, field_list=None, 
                        offset=0, max_lines=None, min_lines=None, max_lines_constraint=None, replace_newlines=0, reverse_order=0,
                        segmentation=None, truncation_mode=None, entity_name='events', post_process=None, pretty_print=True, expanded_nodes=[""], **args):

        '''
        HTML formatted set of events for a given sid. Most of the responsibility of this handler is for graceful slicing of events/results using the Python SDK.
        
        Arg:
        client_app: Name of the application from where the request originated.
        count: The maximum amount of events to show.
        display_row_numbers: Controls the display of positional numbers or not, 0 or 1.
        earliest_time: Earliest time constraint.
        enable_event_actions: Controls if event actions are enabled or not, 0 or 1.
        enable_field_actions: Controls if field actions are enabled or not, 0 or 1. 
        entity_name: Specifies events or results as this can change based on statusbuckets.
        field_list: Comma separated list of fields.
        has_layout: Controls if the event(s) have structural layout around them or not, 0 or 1.
        host_app: Name of the application in which this module is hosted.
        latest_time: Latest time constraint.
        max_lines: Maximum event lines to show, None, 0 or >max_lines_constraint will display max_lines_constraint
        min_lines: Minimum event lines to show, None or <MIN_LINES_CONSTRAINT will display MIN_LINES_CONSTRAINT
        max_lines_constraint: Physical constraint for visible max lines, used for browser crash control defaults to MAX_LINES_CONSTRAINT_DEFAULT if None.
        offset: The offset starting point of the event series. Note, negative offset values are handled.
        post_process: Optional post process search.
        replace_newlines: Control replacement of newline characters.
        reverse_order: Controls whether the results ordering of the <count> being events returned should be reversed or not, 0 to not reverse, 1 to reverse.
        segmentation: Raw markup segmentation, inner, outer, none etc..
        sid: Search job sid.
        truncation_mode: Job related truncation mode for splunkd, defaults to TRUNCATION_MODE_DEFAULT.
        '''
        # get handle to job object, return error if not accessible.
        cherrypy.session.release_lock()
        response_data = {}
        job_lite  = splunk.search.JobLite(sid)

        # get display position setting
        display_row_numbers = splunk.util.normalizeBoolean(display_row_numbers)

        # get enable event actions
        enable_event_actions = splunk.util.normalizeBoolean(enable_event_actions)
        
        # get enable field actions
        enable_field_actions = splunk.util.normalizeBoolean(enable_field_actions)

        # get pretty print
        pretty_print = splunk.util.normalizeBoolean(pretty_print)

        # get has layout
        has_layout = splunk.util.normalizeBoolean(has_layout)

        # get reverse order
        reverse_order = splunk.util.normalizeBoolean(reverse_order)
        
        # get fields for event
        if field_list is None:
            field_list = []
        else:
            field_list = splunk.util.stringToFieldList(field_list)

        # get segmentation for events
        if segmentation is None:
            segmentation = SEGMENTATION_DEFAULT

        # get max_lines_constraint or default constraint
        if max_lines_constraint is None:
            max_lines_constraint = MAX_LINES_CONSTRAINT_DEFAULT
        else:
            max_lines_constraint = int(max_lines_constraint)

        # get max_lines setting or default constraint
        if max_lines is None:
            max_lines = max_lines_constraint
        else:
            max_lines = min(int(max_lines), max_lines_constraint)
            #0 value delimits everything up to safe browser constraint
            if max_lines is 0:
                max_lines = max_lines_constraint

        # get min_lines setting or default constraint
        if min_lines is None:
            min_lines = MIN_LINES_CONSTRAINT
        else:
            min_lines = max(int(min_lines), MIN_LINES_CONSTRAINT)

        # get replace new lines
        replace_newlines = splunk.util.normalizeBoolean(replace_newlines)

        # truncation mode
        if truncation_mode is None:
            truncation_mode = TRUNCATION_MODE_DEFAULT

        # post process search
        if post_process:
            job_lite.setFetchOption(search=post_process)

        # set search sdk fetch options
        # note: python sdk timeFormat setFetchOption breaks events[0:].time SPL-18484
        job_lite.setFetchOption(
            time_format = cherrypy.config.get('DISPATCH_TIME_FORMAT'),
            earliestTime=earliest_time, 
            latestTime=latest_time, 
            maxLines=max_lines, 
            segmentationMode=segmentation,
            truncationMode=truncation_mode,
            # part 1 of SPL-22806 add click support to timestamp in events viewer
            # output_time_format was formerly i18n.ISO8609_MICROTIME
            # however to get epochTime to the client, and workaround various problems in SDK/dt2epoch, 
            # the simplest way was to get the epochTime value from the API directly.
            output_time_format=i18n.ISO8609_MICROTIME
        )
        
        # get offset cast
        offset = int(offset)
        
        # get count cast
        count = int(count)
        rs = None
        try:
            rs = job_lite.getResults(entity_name, offset, count)
            # for backward compatibility (SPL-63711)
            # we are instantiating job object which can be 
            # passed down to custom event handlers 
            job = splunk.search.getJob(sid)
        except splunk.ResourceNotFound, e:
            logger.error('EventsViewer could not find the job=%s. Exception: %s' %(sid, e))
            response_data['error'] = _('The job appears to have expired or has been canceled. Splunk could not retrieve data for this search.') 
        except Exception, e:
            logger.error('EventsViewer exception retrieving results for job=%s. Exception: %s' % (sid, e))
            response_data['error'] =  _('An error occurred. Splunk could not retrieve events for this search.')
        
        if rs == None:
            return self.generateStatusMessage(entity_name, 'nodata', sid)

        if response_data.get('error', None):
            return self.controller.render_template(HTML_TEMPLATE, response_data)

        events = rs.results()

        # re-order events if specified
        if reverse_order:
            events.reverse()

        # retrieve available event renderers
        renderers = eventrenderer.Custom(namespace=client_app)

        qs = {'count' : 1,
              'field_list' : ",".join(field_list),
              'has_layout' : 0,
              'sid' : sid,
              'segmentation' : segmentation,
              'pretty_print' : 1,
              }

        if earliest_time:
            qs['earliest_time'] = earliest_time
        if latest_time:
            qs['latest_time'] = latest_time

        # augment the event object to have additional attributes
        for i, event in enumerate(events):
            
            if event.time:
                # part 1 of SPL-22806 add click support to timestamp in events view
                event.epoch = splunk.util.dt2epoch(splunk.util.parseISO(str(event.time)))

                # NOTE - the client no longer needs or uses the tzoffset data, but 
                #     there may be other custom event renderers out there that have 
                #     copied and pasted references to it. Leaving this in for now.
                event.timezoneOffset = util.getTZOffsetMinutes(float(event.epoch))
                event.time = datetime.datetime.fromtimestamp(float(event.epoch))
            
            # event renderer    
            event.renderer = renderers.getRenderer(event.fields)
            event.json = None
            try:
                raw_str = str(event.raw).strip()

                if (raw_str.startswith('{') and raw_str.endswith('}')) or (raw_str.startswith('[') and raw_str.endswith(']')):
                    event.json = json.loads(raw_str, parse_float=Decimal)
            except:
                pass

            if pretty_print and event.json:
                qs['offset'] = event.offset

                event.pretty_printed = "".join(printjson(event.json,0,"",expanded_nodes,qs))
            else:
                event.pretty_printed = None

        # template args
        # template args
        response_data = args.copy()
        response_data.update({
            "host_app": host_app,
            "client_app": client_app,
            "display_row_numbers": display_row_numbers,
            "earliest_time": earliest_time,
            "enable_event_actions": enable_event_actions,
            "enable_field_actions": enable_field_actions,            
            "events": events,
            "field_list": field_list,
            "has_layout": has_layout,
            "job":job,
            "latest_time": latest_time,
            "min_lines": min_lines,
            "max_lines": max_lines,
            "max_lines_constraint": max_lines_constraint,
            "offset_start": offset,
            "replace_newlines": replace_newlines,
            "segmentation": segmentation,
            "post_process": post_process,
            "pretty_print": pretty_print
        })

        # output the no data messaging
        output = ''
        if len(events) == 0:
            if rs.isPreview():
                output = self.generateStatusMessage(entity_name, 'waiting', sid)
            else:
                output = self.generateStatusMessage(entity_name, 'nodata', sid)

        else:
            output = self.controller.render_template(HTML_TEMPLATE, response_data)

        return output
