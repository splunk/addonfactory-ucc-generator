#!/usr/bin/python
# vim: ts=4 sw=4 expandtab
import BaseHTTPServer
import datetime
import re
import os
import sys

import markdown

DOC_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'www')
BUILD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build', 'www')
TEMPLATE_PATH = os.path.join(DOC_ROOT, '__template__')

NAV = [
    ('/', 'Home'),
    ('/download.htm', 'Download'),
    ('/online_lint.php', 'The Online Lint'),
    ('/docs/', 'Documentation'),
    ('/news/', 'News'),
    ('/contact_support.htm', 'Contact'),
]

# RSS should use absolute URLs, but enable it for everything. Also
# use this post-processor to validate links.
class _URLPostProcessor(markdown.Postprocessor):
    def __init__(self, host, filepath):
        self._host = host
        self._filepath = filepath

    def run(self, doc):
        self._resolvelinks(doc.documentElement)
        return doc

    def _resolvelinks(self, node):
        if node.type != "element":
            return
        for child in node.childNodes:
            self._resolvelinks(child)
        linkattrs = {
            'a': 'href',
            'script': 'src',
            'link': 'href',
            'img': 'src',
        }
        if node.nodeName in linkattrs:
            attrname = linkattrs[node.nodeName]
            if not attrname in node.attribute_values:
                return

            attrvalue = node.attribute_values[attrname]
            if not attrvalue.startswith('http://'):
                if not attrvalue.startswith('/'):
                    targetpath = _get_path_for_url(attrvalue, self._filepath)
                    if not targetpath:
                        raise ValueError, 'Could not resolve URL %s' % attrvalue

                    # Get the folder of the parent path.
                    parenturl = _get_relurl_for_filepath(self._filepath)
                    assert parenturl.startswith('/')
                    parenturl = parenturl.rpartition('/')[0]
                    attrvalue = parenturl + '/' + attrvalue
                    assert _get_path_for_url(attrvalue, None) == targetpath
                attrvalue = 'http://%s%s' % (self._host, attrvalue)
                node.attribute_values[attrname] = attrvalue

def _markdown2doc(host, filepath, source):
    class _PostProcessor(markdown.Postprocessor):
        def run(self, doc):
            self.doc = doc
            return doc
    urlprocessor = _URLPostProcessor(host, filepath)
    postprocessor = _PostProcessor()
    md = markdown.Markdown()
    md.postprocessors.append(urlprocessor)
    md.postprocessors.append(postprocessor)
    md.convert(source)
    return postprocessor.doc

def _get_relurl_for_filepath(filepath):
    assert (filepath + os.sep).startswith(DOC_ROOT + os.sep)
    relpath = filepath[len(DOC_ROOT + os.sep):]
    return '/' + relpath.replace(os.sep, '/')

def _get_path_for_url(url, parentpath):
    root = DOC_ROOT
    if not url.startswith('/'):
        if parentpath:
            root = os.path.dirname(parentpath)
            assert (root + os.sep).startswith(DOC_ROOT + os.sep)
        else:
            raise ValueError, 'Tried resolving relative URL: %s' % url

    urls = [
        url.rstrip('/') + '/index.htm',
        url
    ]
    for url in urls:
        path = os.path.join(root, url.lstrip('/'))
        if path.startswith(root + os.sep) and os.path.isfile(path):
            return path

def _get_nav(path):
    nav = []
    for url, name in NAV:
        navpath = _get_path_for_url(url, None)
        if navpath and navpath == path:
            nav.append('* <a class="active">%s</a>' % name)
        else:
            nav.append('* [%s](%s)' % (name, url))
    return markdown.markdown('\n'.join(nav))

def _remove_comments(source):
    return re.sub('<!--[^>]*-->', '', source)

def _gen_rss(host, path, source, title, link, desc, linkbase):
    def removeblanktextnodes(node):
        for i in range(len(node.childNodes)-1, -1, -1):
            child = node.childNodes[i]
            if child.type == 'text':
                if not child.value:
                    node.removeChild(child)
            else:
                removeblanktextnodes(child)
    text = _remove_comments(source)
    doc = _markdown2doc(host, path, text)

    oldDocElement = doc.documentElement
    removeblanktextnodes(oldDocElement)

    rss = doc.createElement("rss")
    rss.setAttribute('version', '2.0')
    rss.setAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')
    doc.appendChild(rss)

    channel = doc.createElement("channel")
    rss.appendChild(channel)
    if not title:
        raise ValueError, 'Missing @title= setting.'
    if not link:
        raise ValueError, 'Missing @link= setting.'
    if not desc:
        raise ValueError, 'Missing @desc= setting.'
    channel.appendChild(doc.createElement('title', textNode=title))
    channel.appendChild(doc.createElement('link', textNode=link))
    channel.appendChild(doc.createElement('description', textNode=desc))

    guids = []

    item = None
    item_desc = None

    for child in oldDocElement.childNodes:
        if child.type != "element":
            if child.value.strip():
                raise ValueError, 'Expected outer-level element, not text.'
            continue

        if child.nodeName == 'h1':
            pass
        elif child.nodeName == "h2":
            link = len(child.childNodes) == 1 and child.childNodes[0]
            if not link or link.type != 'element' or link.nodeName != 'a':
                raise ValueError, 'Each heading must be a link.'

            titlenode = len(link.childNodes) == 1 and link.childNodes[0]
            if not titlenode or titlenode.type != 'text':
                raise ValueError, 'Each heading link must contain a ' + \
                                  'single text node.'
            heading = titlenode.value.strip()

            # Combine the href with the linkbase.
            assert 'href' in link.attributes
            href = link.attribute_values['href']
            if not linkbase.endswith('/'):
                raise ValueError, 'The @linkbase must be a directory: %s' % \
                                  linkbase
            href = linkbase + href

            if href in guids:
                raise ValueError, "Duplicate link: %s" % href
            guids.append(href)

            item = doc.createElement("item")
            channel.appendChild(item)
            item.appendChild(doc.createElement("link", href))
            item.appendChild(doc.createElement("title", heading))
            item.appendChild(doc.createElement("guid", href))
            item_desc = None

        elif child.nodeName in ["p", "ul", "blockquote"] :
            if not item_desc:
                # The first paragraph is <p><em>pubDate</em></p>
                em = len(child.childNodes) == 1 and child.childNodes[0]
                if not em or em.type != 'element'  or em.nodeName != 'em':
                    raise ValueError, 'The first paragraph must contain ' + \
                                      'only an <em>.'

                emchild = len(em.childNodes) == 1 and em.childNodes[0]
                if not emchild or emchild.type != 'text':
                    raise ValueError, "The first paragraph's em must " + \
                                      "contain only text."
                pubdate = emchild.value

                format = "%a, %d %b %Y %H:%M:%S +0000"
                dateobj = datetime.datetime.strptime(pubdate, format)
                normalized = dateobj.strftime(format)
                if normalized != pubdate:
                    raise ValueError, 'Encountered date %s but expected %s' % \
                                      (pubdate, normalized)


                item.appendChild(doc.createElement('pubDate', emchild.value))
                item_desc = doc.createElement("description")
                item.appendChild(item_desc)
            else:
                cdata = doc.createCDATA(child.toxml())
                item_desc.appendChild(cdata)

        else:
            raise ValueError, 'Unsupported node type: %s' % child.nodeName
    return doc.toxml()

def _preprocess(path):
    def _include(match):
        # Disallow changing directories because of how links, etc
        # will resolve.
        url = match.group(1).strip()
        if '/' in url:
            raise ValueError, 'Inclusions cannot cross directories'

        # When including a file, update global settings and replace
        # with contents.
        includepath = _get_path_for_url(url, path)
        if not includepath:
            raise ValueError, 'Unmatched URL: %s' % match.group(1)
        settings, contents = _preprocess(includepath)
        childsettings.update(settings)
        return contents

    source = open(path).read()

    # Process includes.
    childsettings = {}
    source = re.sub('<!--@include ([^>]*)-->', _include, source)

    # The settings defined in the outer file will rule.
    settings = dict(re.findall(r'^@(\w+)=(.*)$', source, re.MULTILINE))
    source = _remove_comments(source)
    source = source.replace('__BASENAME__', os.path.basename(path))
    return settings, source

def _transform_markdown(host, path):
    settings, source = _preprocess(path)
    page = markdown.markdown(source)

    postprocessor = _URLPostProcessor(host, path)
    md = markdown.Markdown()
    md.postprocessors.append(postprocessor)
    return settings, md.convert(source)

def _transform_file(host, path):
    source = open(path, 'rb').read()
    if path.endswith('.css'):
        return 'text/css', source
    elif path.endswith('.gif'):
        return 'image/gif', source
    elif path.endswith('.png'):
        return 'image/png', source
    elif path.endswith('.ico'):
        return 'image/x-icon', source
    elif path.endswith('.inc'):
        return 'text/plain', source
    elif path.endswith('.rss'):
        settings, source = _preprocess(path)
        return 'text/xml', _gen_rss(host, path, source,
                                    settings.get('title'),
                                    settings.get('link'),
                                    settings.get('desc'),
                                    settings.get('linkbase'))
    elif path.endswith('.htm') or path.endswith('.php') or \
         not '.' in os.path.basename(path):
        settings, page = _transform_markdown(host, path)
        if 'template' in settings:
            # TODO: encode keywords
            keywords = dict(settings)
            del keywords['template']
            keywords['body'] = page
            keywords['nav'] = _get_nav(path)
            template_path = os.path.join(DOC_ROOT, settings['template'])
            page = open(template_path).read() % keywords
        return 'text/html', page
    else:
        raise ValueError, 'Invalid file type: %s' % path

class _Handler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_GET(self):
        path = _get_path_for_url(self.path, None)
        if path:
            host = '%s:%s' % (self.server.server_name, \
                              self.server.server_port)
            try:
                self._send_response(*_transform_file(host, path))
            except Exception:
                self.send_error(500, "TRACEBACK")
                raise
        else:
            self.send_error(404, "File not found")

    def _send_response(self, contenttype, content):
        self.send_response(200)
        self.send_header("Content-type", contenttype)
        self.send_header("Content-length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def runserver(host):
    if host:
        addr, _, port = host.partition(':')
    else:
        addr = ''
        port = 8000

    httpd = BaseHTTPServer.HTTPServer((addr, port), _Handler)
    httpd.serve_forever()

def build(host):
    def findfiles(searchroot):
        """ Returns relative paths in root.
        """
        for root, dirs, files in os.walk(searchroot):
            if '.svn' in dirs:
                dirs.remove('.svn')
            for file in files:
                abspath = os.path.join(root, file)
                assert abspath.startswith(searchroot + os.sep)
                relpath = abspath[len(searchroot + os.sep):]
                yield relpath

    if not host or '/' in host:
        raise ValueError, 'Host must be sub.domain.com'

    for relpath in findfiles(DOC_ROOT):
        sourcepath = os.path.join(DOC_ROOT, relpath)
        destpath = os.path.join(BUILD_DIR, relpath)
        if not os.path.isdir(os.path.dirname(destpath)):
            os.makedirs(os.path.dirname(destpath))

        content_type, contents = _transform_file(host, sourcepath)
        outfile = open(destpath, 'wb')
        try:
            outfile.write(contents)
        finally:
            outfile.close()

def main(action='', host=''):
    if action == 'server':
        runserver(host)
        return
    if action == 'build':
        build(host)
        return
    print >>sys.stderr, """\
Usage: www.py [server|build] <host>

server     runs a test server on localhost
build      generates static HTML files from the markup
"""
    sys.exit(1)

if __name__ == '__main__':
    main(*sys.argv[1:])

