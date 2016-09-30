
import sys
import re
import logging

from splunk import RESTException

from .util import logger

__all__ = ['RestHandlerError', 'ERROR_MAPPING']


"""Errors mapping for add-on. Edit it when you need to add new error type.
Extend it if need.
"""
ERROR_MAPPING = {
     #default error while calling Splunk REST API with 'splunk.rest.simpleRequest'.
     400: 'Bad Request',
     401: 'Client is not authenticated',
     402: 'Current license does not allow the requested action',
     403: 'Client is not authorized to perform the requested action',
     404: 'Resource/Endpoint requested dose not exist',
     409: 'Conflict occurred due to existing object with the same name',
     500: 'Splunkd internal error',
     
     
     
     #Rest handler error/add-on predefined error.
     1000: 'An Add-on Internal ERROR Occurred',
     1001: 'Fatal Error',
     1002: 'Some mandatory attributes are missing or unusable for the handler',
     
     1020: 'Fail to encrypt credential information',
     1021: 'Fail to decrypt the encrypted credential information',
     1022: 'Fail to delete the encrypted credential information',
     
     1100: 'Unsupported value in request arguments, please check documentation for usage',
     1101: 'Unsupported action on the requested endpoint',
     
     
     
     #TODO: add custom error below, it can be used in custom validation.
     #It should be in form ('error code: 'error message',) and 'error code' a bigger-than-1200 integer, like
     #'1201: 'Some thing is wrong',
     1201: 'No AWS product is specified',
     1202: 'ERROR in handling AWS proxy, please check the documentation for request parameters',
             
}


class RestHandlerError(object):
    """Control Error in Splunk Add-on REST API.
    code-message mapping for errors: 
        code<1000: error occurred while calling Splunk REST API, 
        1000=<code<=1200: add-on predefined error, 
        code>=1201: error for customized rest handler
    """
    
    def __init__(self, code, msgx=''):
        if code==-1:
            self._conv(code, msgx)
        else:
            self._code = code
            self._msgx = msgx
            self._msg = RestHandlerError.map(code)
        
    def __str__(self):
        msgx = (self._msgx and self._msgx!=self._msg) and ' - %s' % self._msgx or ""
        return 'Splunk Add-on REST Handler ERROR[%s]: %s%s' % (self._code, self._msg, msgx)
   
    def _conv(self, code, exc):
        """Convert a Exception form 'splunk.rest.simpleRequest'
        """
        if isinstance(exc, RESTException):
            self._code = exc.statusCode
                
            try:
                self._msg = RestHandlerError.map(self._code)
            except:
                self._msg = exc.get_message_text().strip()
                
            msgx = exc.get_extended_message_text().strip()
            if self._msg==msgx:
                self._msg='Undefined Error'
            try:
                pattern = r'In handler \'\S+\': (?P<msgx>.*$)'
                m=re.match(pattern, msgx)
                groupDict=m.groupdict()
                self._msgx = groupDict['msgx']
            except:
                self._msgx = msgx
        else:
            self._code = 500
            self._msg = RestHandlerError.map(self._code)
            self._msgx = str(exc)
            
    
    @staticmethod
    def map(code):
        """Map error code to message. Raise an exception if the code dose not exist.
        @param code: error code
        @param shouldRaise: should raise an exception when the code dose not exist
        """
        msg = ERROR_MAPPING.get(code)
        assert msg, 'Invalid error code is being used - code=%s' % code
        return msg
    
    
    @staticmethod
    def ctl(code, msgx='', logLevel=logging.ERROR, shouldPrint=True, shouldRaise=True):
        """Control error, including printing out the error message, logging it and raising an exception (BaseException). 
        @param code: error code (it should be -1 if 'msgx' is an exception of 'splunk.RESTException')
        @param msgx: extended message/detail, which will make it more clear (it can be an exception of 'splunk.RESTException')
        @param logLevel: logging level (normally, it should be ERROR for Add-on internal error/bug, INFO for client request error)
        @param shouldPrint: is it required to print error info (the printed content will be shown to user)
        @param shouldRaise: is it required to raise an exception (the process will be terminated if an exception raised)
        
        Use Cases:
        1. for exception (exc) of 'splunk.RESTException': RestHandlerError.ctl(code=-1, msgx=exc, logLevel=logging.INFO)
        2. for add-on internal error/bug: assert 'expression', RestHandlerError.ctl(code=1000, msgx='some detail...', shouldPrint=False, shouldRaise=False)
        3. for client request error, RestHandlerError.ctl(code=1201, msgx='some detail...', logLevel=logging.INFO)
        """
        err = RestHandlerError(code, msgx=msgx)
        logger.log(logLevel, err, exc_info=1)
        if shouldPrint:
            sys.stdout.write(str(err))
        if shouldRaise:
            raise BaseException(err)
        return err

