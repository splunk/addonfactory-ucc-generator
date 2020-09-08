#
# Splunk UI module python renderer
# This module is imported by the module loader (lib.module.ModuleMapper) into
# the splunk.appserver.mrsparkle.controllers.module.* namespace.
#


# required imports
import cherrypy, datetime
import controllers.module as module

# common imports
import xml.sax.saxutils as su
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n

# logging setup
import logging
logger = logging.getLogger('splunk.appserver.controllers.module.SingleValue')

# define standard time field name        
TIME_FIELD = '_time'

# define a delimiter that can be used to pass content and a css class down to the module via generateResults
# and css class name to add when the module is displaying an exception
CSS_CLASS_DELIMITER = '//!-!//'
EXCEPTION_CSS_CLASS = 'SingleValueHolderWithException'

            
class SingleValue(module.ModuleHandler):
    
    def generateResults(self, host_app, client_app, sid, entity_name='results', label=None, field=None, classField=None, format=None, postprocess=None, show_preview=True):
    
        # assert input
        if not sid:
            raise Exception('SingleValue.generateResults - sid not passed!')

        try:
            job = splunk.search.JobLite(sid)
        except Exception, e:
            return self.generateErrorMessage(_('Job not available'))
        
        job.setFetchOption(output_time_format=i18n.ISO8609_MICROTIME)

        if postprocess:
            job.setFetchOption(search=postprocess)
            
        if field:
            field_list = [field]
            if classField:
                field_list.append(classField)

            job.setFetchOption(f=field_list)

        if splunk.util.normalizeBoolean(show_preview) and entity_name == 'results':
            entity_name = 'results_preview'

        try:
            rs = job.getResults(entity_name, 0, 1)
        except Exception, e:
            return self.generateErrorMessage(_('Results not available'))

        if rs == None:
            return self.generateErrorMessage(_('Invalid Job'))
            
        value = None

        if rs and len(rs.results()) > 0:
            fieldNames = [x for x in rs.fieldOrder() if (not x.startswith('_') or x == TIME_FIELD)]

            if not field:
                if len(fieldNames) > 0:
                    field = fieldNames[0]

            if not classField:
                if len(fieldNames) > 1:
                    classField = fieldNames[1]

            if field:
                rf = rs.results()[0].get(field)
                if rf: 
                    value = rf[0].value

        if value != None:
            try:
                if format == 'number':
                    value = i18n.format_number(float(value))
                elif format == 'decimal':
                    value = i18n.format_decimal(float(value))
                elif format == 'percent':
                    value = i18n.format_percent(float(value))
                elif format == 'unixtime':
                    dt = datetime.datetime.fromtimestamp(float(value))
                    value = i18n.format_datetime(dt)
            except Exception, e:
                logger.error('Unable to cast value to %s; got %s' % (format, value))
                
            if len(classField):
                classValue = rs.results()[0].get(classField)
                if classValue:
                    className = classValue[0].value
                    return "%s%s%s" % (value, CSS_CLASS_DELIMITER, className)
            
            return value
            
        return _('N/A')

    def generateErrorMessage(self, errorString):
        return '%s%s%s' % (su.escape(errorString), CSS_CLASS_DELIMITER, EXCEPTION_CSS_CLASS)
