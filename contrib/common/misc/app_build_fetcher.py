#!/bin/env python
#
# intended as a versatile build artifact access utiliy, this cgi script is
# self-referencing. The basic invocation will produce a simple web form.
# Calling it w/GET args will return the specified artifact as a mime attachment 
# or a url link to the attchement depending on the args.
# jterry@splunk.com 20131002

import sys, cgitb, cgi
import sets, os, re, glob
 
cgitb.enable()
releases_dir = '/usr/local/bamboo/releases'

def get_app_dirs():
    app_dirs = []
    for (path, dirs, files) in os.walk(releases_dir):
        if path.endswith('latest'):
            app_dirs.append(os.path.basename(os.path.dirname(path)))
    return ''.join(['<option>%s</option>' % dir for dir in sorted(app_dirs)])

def print_http(txt):
    print 'Content-type: text/html\n'
    print txt

def validate_form_data(cgi_form):
    if len(cgi_form) == 0:
        display_form(get_app_dirs(), msg='Solutions Build Fetcher')
        sys.exit(0)

    #print_http(cgi_form)
    form = {}

    if 'SOLN' in cgi_form and len(cgi_form['SOLN'].value) > 0:
        form['SOLN'] = cgi_form['SOLN'].value
        form['FETCH_TYPE'] = 'soln'
    else:
        _txt = 'Required Solution unspecified'
        display_form(get_app_dirs(), msg=_txt)
        sys.exit(0)

    try:
        form['DELIVER_AS'] = cgi_form['DELIVER_AS'].value
        if not re.match('url|file', form['DELIVER_AS']):
            print_http('Invalid value for DELIVER_AS: %s' % form['DELIVER_AS'])
            sys.exit(1)
    except:
        print_http('Error: value for DELIVER_AS required')
        sys.exit(1)

    try:
        form['VERSION'] = cgi_form['VERSION'].value
        if re.match('latest', form['VERSION']):
            form['SPECIFIC_VERSION'] = 'latest'
        elif re.match('specific_version', form['VERSION']):
            try:
                form['SPECIFIC_VERSION'] = cgi_form['SPECIFIC_VERSION'].value
            except:
                print_http('Error: value for SPECIFIC_VERSION required')
                sys.exit(1)
        else:
            print_http('Invalid value for VERSION: %s' % form['VERSION'])
            sys.exit(1)
    except:
        print_http('Error: value for VERSION required')
        sys.exit(1)

    try:
        # Tossing the supplied value here: existence = True
        _junk = cgi_form['SHOW_GET_URL'].value
        show_get_url = True
    except:
        show_get_url = False

    if show_get_url:
        get_url = 'http://sc-build.sv.splunk.com:8081/cgi-bin/app_build_fetcher.py?'

        for key in form.keys():
            if not key == 'FETCH_TYPE':
                get_url += '%s=%s&' % (key, form[key])

        print_http(get_url.rstrip('&'))
        sys.exit(0)

    return form

def fetch(form):
    if form['FETCH_TYPE'] == 'soln':
        if form['SPECIFIC_VERSION'] == 'latest':
            for (path, dirs, files) in os.walk(releases_dir):
                if path.endswith('/%s/%s' % (form['SOLN'], form['SPECIFIC_VERSION'])):
                    try:
                        deliver('%s/%s' % (path, files[0]), form['DELIVER_AS'])
                    except:
                        print_http('Error: no pkg found in %s' % path)
                        sys.exit(0)
        else:
            for (path, dirs, files) in os.walk(releases_dir):
                if re.search('/%s/releases/.+?/%s$' % (form['SOLN'], form['SPECIFIC_VERSION']), path):
                    try:
                        files = [x for x in files if re.search('spl$|zip$|tgz$', x)]
                        deliver('%s/%s' % (path, files[0]), form['DELIVER_AS'])
                    except:
                        print_http('Error: no pkg found in %s' % path)
                        sys.exit(0)
    else:
        print_http('Error: FETCH_TYPE: %s unsupported' % form['FETCH_TYPE'])

def deliver(pkg_path, deliver_as):
    if deliver_as == 'url':
        _prefix = 'http://sc-build.sv.splunk.com:8081'
        _sub_path = pkg_path[len('/usr/local/bamboo/releases'):]
        print_http('%s%s' % (_prefix, _sub_path))
    else: # deliver_as = 'file'
        print 'Content-Type: application/octet-stream'
        print 'Content-Disposition: attachment; filename=%s\n' % re.search('.+/(.+)$', pkg_path).group(1)   
        f = open(pkg_path, 'rb')
        sys.stdout.write(f.read())
        f.close()

def display_form(options, msg='Splunk Build Fetcher'):
    html_form = """Content-type: text/html\n\n
        <html>
          <head>
            <title>%s</title>
          </head>
          <body>
            <h3 align="center">%s</h3>
            <br> <br>
            <form enctype="multipart/form-data" action="app_build_fetcher.py" method="post" charset="UTF-8">
              Select the Solution: <select name="SOLN">%s</select> <br>
              <table> <br> <br>
                <tr>
                  <td valign="top"> Pick a version: </td>
                  <td> 
                    &nbsp<input type="radio" name="VERSION" value="latest" checked/>latest build <br>
                    &nbsp<input type="radio" name="VERSION" value="specific_version"/>specific version
                    <input type="text" size=8 name="SPECIFIC_VERSION"/>
                  </td>
                </tr>
              </table> <br>
              <table> <br> <br>
                <tr>
                  <td valign="top"> I want the: </td>
                  <td> 
                    &nbsp<input type="radio" name="DELIVER_AS" value="url" checked/>URL <br>
                    &nbsp<input type="radio" name="DELIVER_AS" value="file" />File
                  </td>
                </tr>
              </table> <br>
              <input type="checkbox" name="SHOW_GET_URL" value="true" /> Just show the GET URL so i can script this thing.<br><br><br>
              <input type="submit" value="Fetch!" style="color:#000000;background:#66FF00"/>
            </form>
          </body>
        </html>
    """ % (msg, msg, options)

    print html_form
    sys.exit(0)

# this is the entry point
try:
    fetch(validate_form_data(cgi.FieldStorage()))
except Exception as e:
    print_http('Exception: %s' % e) 

