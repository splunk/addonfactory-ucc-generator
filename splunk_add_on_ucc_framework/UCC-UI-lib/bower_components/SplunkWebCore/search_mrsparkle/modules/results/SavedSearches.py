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

import urllib, re, logging

logger = logging.getLogger('foo.bar');

class SavedSearches(module.ModuleHandler):
    '''
    Returns a list of saved searches
    '''
    
    def generateResults(self, **args):
        savedSearches = splunk.entity.getEntities('saved/searches', namespace=args['client_app'], sessionKey=cherrypy.session['sessionKey'])

        # right now we're screening NOT searches until they are correctly parsed by ivan
        fieldSearchPattern = re.compile(r'.*\$[\w]+\$.*|.*NOT.*')
        
        html = ['<ul>']
        for key in savedSearches.keys():
            search = savedSearches[key].properties.get('search')
            if search and not fieldSearchPattern.match(search):
                html.append('<li><a href="?q=%s">%s</a></li>' % (urllib.quote(search), key))
                #html.append('<li><a href="?s=%s">%s</a></li>' % (urllib.quote('search ' + savedSearches[key]['search']), savedSearches[key].name))
        html.append('</ul>')
        
        return ' '.join(html)
