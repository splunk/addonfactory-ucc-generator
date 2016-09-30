from urllib import urlencode
import re
import Cookie
import json

import httplib2
from lxml import html
import pdb

# known issue:
# sometimes request will raise httplib.BadStatusLine exception

class SplunkWebException(Exception):
    pass

class SplunkWebLoginException(SplunkWebException):
    pass

class SplunkWeb(object):
    """Usage:

    >>> splunkweb = SplunkWeb()
    >>> response, content = splunkweb.request('/en-US/app/launcher/home', 'GET', {'foo','bar'}, {'Content-Type': 'charset=UTF-8'})
    """

    def __init__(self, username='admin', password='changeme',
                       hostpath='http://localhost:8000'):
        self.hostpath = hostpath
        self.http = httplib2.Http(disable_ssl_certificate_validation=True)
        self.http.follow_redirects = 0
        self.session = None
        self.splunkversion = None
        try:
            self.port = hostpath[hostpath.rfind(":")+1:]
        except ValueError,e:
            #We couldnt find a string port, default to 8000
            self.port = '8000'

        # Run _login twice because the first run after splunk installation will fail
        self._login(username, password)
        self._login(username, password)
        self.formkey = self._get_formkey()

    def _login(self, username, password):
        try:
            url = self.hostpath + '/en-US/account/login'
            response, content = self.http.request(url, 'GET')
            assert response.status == 200, response

            cval = re.findall(r'cval=(\d+)', response['set-cookie'])[0]
            headers = {
                'Cookie':"cval=%s" % cval,
                'Content-type':'application/x-www-form-urlencoded'
            }
            body = urlencode({
                'username':username,
                'password':password,
                'cval':cval
            })

            response, content = self.http.request(url, 'POST', body, headers)
        except httplib2.SSLHandshakeError:
            raise SplunkWebLoginException("Error while trying to establish an SSL connection to <%s>." % url)
        except Exception as e:
            raise SplunkWebException("Got error while trying to login to SplunkWeb: %s" % `e`)

        if response.status == 200:
            pass
            # this is a first-time login
        else:
            assert response.status == 303

        cookie = response['set-cookie']
        session_match = (re.findall(r'splunkd_'+self.port+'=([^;]+)', cookie) or
                         re.findall(r'session_id_'+self.port+'=(\w+)', cookie))
        if not session_match:
            raise SplunkWebException("Could not retrieve session key")
        self.session_old_style = "session_id_" + self.port + "=" in cookie
        self.session = session_match[0]

        csrf = re.findall(r'splunkweb_csrf_token_'+self.port+'=(\w+)', response['set-cookie'])
        if csrf:
            self.csrf = csrf[0]
            self.splunkversion = 6
        else:
            self.splunkversion = 5

    def _get_formkey(self):
        # formkey is not required for Splunk 6
        if self.splunkversion >= 6:
            return None

        formkey = None
        response, content = self.request('/en-US/app/launcher/home')
        assert response.status == 200

        try:
            formkey = re.findall(r'window.\$C\s*=\s*{.*"FORM_KEY":\s*"(\d+)"',
                content)[0]
        except:
            ''' sometimes splunkweb return partial html, so search another pattern instead '''
            try:
                formkey = re.findall(r'<input type="hidden" name="splunk_form_key" value="(\d+)" />', content)[0]
            except:
                assert 0, 'Cannot get form key'
        assert formkey
        return formkey

    def request(self, path='/', method='GET', body={}, headers={}, query={}):
        """Return tuple of (response, content) of http request.
        method = 'GET', 'POST', ...
        body = dict or urlencoded post parameters
        headers = dict of http headers
        query - the query params used, if applicable
        """

        assert self.session, 'login first'
        assert path.startswith('/')
        assert method in ('OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE',
            'TRACE', 'CONNECT', 'PATCH')

        if isinstance(body, dict):
            if headers.get('Content-Type', '') == 'application/json':
                body = json.dumps(body)
            else:
                body = urlencode(body)

        query_params = ''
        if len(query) != 0:
            query_params = '?' + urlencode(query)

        url = self.hostpath + path + query_params
        cookie = Cookie.SimpleCookie(headers.get('Cookie'))
        if self.session_old_style:
            cookie['session_id_' + self.port] = self.session
            headers['Cookie'] = '%s=%s' % ('session_id_' + self.port, self.session)
        else:
            cookie['splunkd_' + self.port] = self.session
            headers['Cookie'] = '%s=%s' % ('splunkd_' + self.port, self.session)
        if self.splunkversion >= 6:
            headers['Cookie'] = headers['Cookie'] + '; splunkweb_csrf_token_' + self.port + '=%s' % self.csrf

        if method in ('POST', 'PUT', 'DELETE'):
            headers.setdefault('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            headers.update({
                'X-Requested-With': 'XMLHttpRequest',
                'X-Splunk-Form-Key': self.csrf if self.splunkversion>=6 else self.formkey
            })

        response, content = self.http.request(url, method, body, headers)
        return response, content

if __name__ == '__main__':
    import doctest
    doctest.testmod()
