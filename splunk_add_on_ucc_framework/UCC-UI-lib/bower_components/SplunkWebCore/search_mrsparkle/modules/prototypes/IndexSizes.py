# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

# required imports
import cherrypy
import controllers.module as module

# common imports
import splunk, splunk.search, splunk.util, splunk.entity
import lib.util as util
import lib.i18n as i18n

class IndexSizes(module.ModuleHandler):
    '''
    Provides controller output for the index summary
    '''

    def generateResults(self, **args):
        
        indexes = splunk.entity.getEntities('data/indexes', sessionKey=cherrypy.session['sessionKey'])
        indexes = [indexes[x] for x in sorted(indexes.keys()) if not x.startswith('_')]
        
        globalCount = 0
        
        for item in indexes:
            globalCount += int(item['totalEventCount'])
            
            for k in ('totalEventCount', 'currentDBSizeMB'):
                item[k] = i18n.format_number(int(item[k]))
                
        
        templateArgs = {
            'globalEventCount': i18n.format_number(globalCount),
            'indexes': indexes,
            'showDetails': splunk.util.normalizeBoolean(args.get('showDetails'))
        }
        
        return self.controller.render_template('prototypes/IndexSizes_pre.html', templateArgs)
