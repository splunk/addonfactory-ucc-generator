# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

# coding=UTF-8

import cherrypy, logging, splunk.search
import controllers.module as module

logger = logging.getLogger('splunk.modules.fieldpicker')

HTML_TEMPLATE = 'search/FieldPicker_generate_results.html'
FILTER_KEYS = ['keyword', 'percent']
SORT_KEYS = ['key', 'distinct_count', 'percent']
DEFAULT_SORT_KEY = 'key'
SORT_DIRS = ['asc', 'desc']
DEFAULT_SORT_DIR = 'asc'
DEFAULT_HAS_LAYOUT = True

class FieldPicker(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, field_list=None, filter_keyword=None, filter_percent=None, has_layout=None, sort_key=None, sort_dir=None, **args):
        '''
        The module framework allows for only one default python controller action, this has to be manually switched based on a get param
        for multiple controller handlers.
        
        !!!WARNING!!! Use job_summary reference over job.summary attribute as SearchJob __getattr__ invokes requests.
        
        Args:
        host_app: The name of the application in which this module is hosted.
        client_app: The name of the application from where the request originated.
        sid: The job sid.
        field_list: Comma separated list of fields.
        filter_keyword: Optional keyword value to filter against (Currently this is manual as SDK does expose summary get params)
        filter_percent: Optional percent value to filter against (Currently this is manual as SDK does expose summary get params)
        has_layout: Bit flag to control if the full layout is used or not, defaults to enabled.
        sort_key: One of SORT_KEYS (Optional).
        sort_dir: One of SORT_DIRS (Optional).
        '''
        summary_options = {}
        if filter_keyword is not None:
            summary_options['search'] = filter_keyword
        if filter_percent is not None:
            summary_options['min_freq'] = float(filter_percent)/100

        # retrieve job
        try:
            job = splunk.search.getJob(sid)
        except Exception, e:
            logger.error("Could not load job %s" % e)
            cherrypy.response.status = 400
            return '<p class="FieldPickerWarn">%s</p>' % _("Could not retrieve job, check if it is valid or expired.")

        # retrieve summary information (can fail with various states)
        message = _("No fields to display for this search.")
        no_fields = False
        if job.statusBuckets==0:
            no_fields = True
        else:
            try:
                job.setFetchOption(summary=summary_options)
                job_summary = job.summary
            except Exception, e:
                logger.error("Could not load summary %s" % e)
                no_fields = True
        if no_fields:
            cherrypy.response.status = 400
            return '<p class="FieldPickerWarn">%s</p>' % message

        if field_list is None:
            field_list = []
        else:
            field_list = splunk.util.stringToFieldList(field_list)
        field_summary_sorted_keys, sort_key, sort_dir = self.sort_field_summary_keys(job_summary, sort_key=sort_key, sort_dir=sort_dir)
        has_layout = splunk.util.normalizeBoolean(has_layout) if has_layout is not None else DEFAULT_HAS_LAYOUT
        template_args = {
            'job': job,
            'job_summary': job_summary,
            'field_list': field_list,
            'field_summary_sorted_keys': field_summary_sorted_keys,
            'filter_keyword': filter_keyword,
            'filter_percent': filter_percent,
            'has_layout': has_layout,
            'sort_dir': sort_dir,
            'sort_key': sort_key,
        }
        return self.controller.render_template(HTML_TEMPLATE, template_args)

    def sort_field_summary_keys(self, job_summary, sort_key=None, sort_dir=None):
        '''
        Returns a tuple of sorted keys, sort_key or default sork_key if None and sort_dir or default sort_dir if None
        
        Args:
        job_summary: Python SDK job summary object
        sort_key: One of SORT_KEYS.
        sort_dir: One of SORT_DIRS.
        '''
        sort_key = sort_key if sort_key in SORT_KEYS else DEFAULT_SORT_KEY
        sort_dir = sort_dir if sort_dir in SORT_DIRS else DEFAULT_SORT_DIR
        keys = [unicode(x) for x in job_summary.fields.keys()]
        if sort_key=='key':
            keys.sort(key=unicode.lower)
        elif sort_key=='percent':
            keys.sort(cmp=lambda x, y: -1 if job_summary.fields[x]['count'] / float(job_summary.count) > job_summary.fields[y]['count'] / float(job_summary.count) else 1)
        elif sort_key=='distinct_count':
            sort_key_lookup = 'distinctCount'
            keys.sort(cmp=lambda x, y: -1 if job_summary.fields[x][sort_key_lookup] > job_summary.fields[y][sort_key_lookup] else 1 )
        if sort_dir=='desc':
            keys.reverse()
        return keys, sort_key, sort_dir
