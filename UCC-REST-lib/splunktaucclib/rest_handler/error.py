"""
Error Handling.
"""

from __future__ import absolute_import
from splunk.appserver.mrsparkle.lib import i18n

__all__ = ['STATUS_CODES', 'RestError']


# HTTP status codes
STATUS_CODES = {
    400: _('Bad Request'),
    401: _('Unauthorized'),
    402: _('Payment Required'),
    403: _('Forbidden'),
    404: _('Not Found'),
    405: _('Method Not Allowed'),
    406: _('Not Acceptable'),
    407: _('Proxy Authentication Required'),
    408: _('Request Timeout'),
    409: _('Conflict'),
    411: _('Length Required'),
    500: _('Internal Server Error'),
    503: _('Service Unavailable')
}


class RestError(Exception):
    """
    REST Error.
    """

    def __init__(self, status, message):
        self.status = status
        self.reason = STATUS_CODES.get(
            status,
            _('Unknown Error'),
        )
        self.message = message
        err_msg = sprintf(_('REST Error [%(status)s]: %(reason)s -- %(message)s') % {
            'status': self.status,
            'reason': self.reason,
            'message': self.message
        })
        super(RestError, self).__init__(err_msg)
