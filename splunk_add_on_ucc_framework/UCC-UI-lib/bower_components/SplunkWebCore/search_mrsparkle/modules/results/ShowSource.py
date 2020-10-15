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
import json

# common imports
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n
import cgi

# logging setup
import logging
logger = logging.getLogger('splunk.appserver.controllers.module.ShowSource')

MAX_LINES_CONSTRAINT_DEFAULT = 500

class ShowSource(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, max_lines_constraint=None, offset=None, latest_time=None, field=None, count=50):
    
        # assert input
        if not sid:
            raise Exception('ShowSource.generateResults - sid not passed!')
            
        # get job
        try:
            job = splunk.search.getJob(sid, sessionKey=cherrypy.session['sessionKey'])
        except splunk.ResourceNotFound:
            return _('Invalid Job')
            
        # get max_lines_constraint or default constraint
        if max_lines_constraint is None:
            max_lines_constraint = MAX_LINES_CONSTRAINT_DEFAULT
        else:
            max_lines_constraint = int(max_lines_constraint)
        
        # set formatting
        job.setFetchOption(output_time_format=i18n.ISO8609_MICROTIME)
        job.setFetchOption(maxLines=max_lines_constraint)
        job.setFetchOption(surrounding="1")
        job.setFetchOption(field_list="_raw,target,MSG_TYPE,MSG_CONTENT,_decoration")
        job.setFetchOption(output_mode="json")

        if offset:
            job.setFetchOption(offset=offset)

        if latest_time:
            job.setFetchOption(latestTime=latest_time)

        try:
            feed = json.loads(job.getFeed(mode='events', count=count))
        except Exception, e:
            logger.warn('%s' % e)
            return _('Show source not available for this event.')

        messageEvents = []
        sourceEvents = []
        
        for event in feed.get('results', []):
            if "_raw" in event.keys():
                sourceEvents.append( event )
            elif event.get('count') == 0:
                messageEvents.append( _('Search job returned no results.') )
                break
            elif "MSG_CONTENT" in event:
                messageEvents.append( event )
            else:
                logger.error( str( event ) )

        eventHtml = []
        for event in sourceEvents:
            isTarget = splunk.util.normalizeBoolean(event.get("target", ""))
            isGap = event.get("_decoration","") == "showsourceGap"
            isInValid = event.get("_decoration","") == "showsourceInvalid"
            cssClass = ""
            if isTarget:
                cssClass = " SourceLineHL"
            elif isGap:
                cssClass = " SourceLineGAP"
            elif isInValid:
                cssClass = " SourceLineINVALID"
            eventHtml.append( "<div class='SourceLine%s splFont-mono'><pre>%s</pre></div>" % (cssClass, cgi.escape(event["_raw"]) ))
            
        msgHtml = []
        for event in messageEvents:
            if 'MSG_CONTENT' in event:
                msg = event["MSG_CONTENT"]
            else:
                msg = event
            msgHtml.append("<div class='MessageLine'><pre>%s</pre></div>" % cgi.escape(str(msg)))
            
        return "".join(msgHtml) + "".join(eventHtml)