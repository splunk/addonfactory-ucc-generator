
# required imports
import cherrypy
import controllers.module as module

from splunk.appserver.mrsparkle import lib

class BreadCrumb(module.ModuleHandler):
    
    # this is not used to render any data.  
    # Instead BreadCrumb uses this to post messages into the SessionQueue 
    # right before redirecting to another page.
    # So then the message is pulled out of the queue and displayed in the next page
    #
    def generateResults(self,  host_app, client_app, message):
        lib.message.send_client_message("INFO", message);
        # however it also sets a response header that normally 
        # would trigger an immediate GET to the messages endpoint. 
        # since this URL is intended to be hit on a page right as we're leaving
        # but it's intended to post a message that displays on the page we're 
        # going to,  we have to be a little careful.  
        cherrypy.response.headers['X-Splunk-Messages-Available'] = 0
        return ""

