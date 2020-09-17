#
# RelaxNG validator utility
#
# This script will validate every XML file found inside of the current Splunk
# instance's /etc/apps directory
#
# See README.txt for setup information
#

import lxml.etree as et
import os, re, sys
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path
from optparse import OptionParser

optionParser = OptionParser(usage='Usage: %prog [options] <pattern>...')
optionParser.add_option('-v', dest='verbose', action='store_true', default=False, help='Enable verbose output')
optionParser.add_option('--simple', dest='simplexml', action='store_true', default=False,
                        help='Only validate Simple XML views')
optionParser.add_option('-a', '--app', dest='app', default=None, help='Only validate views within the specified app')
options, args = optionParser.parse_args()

schemaFile = 'all.rng'
if options.simplexml:
    schemaFile = 'simplexml.rng'
f = open(os.path.normpath(os.path.join(__file__, '..', schemaFile)), 'r')
schemaDoc = et.parse(f)
schema = et.RelaxNG(schemaDoc)
f.close()

patterns = [re.compile(r'\bui\b')]

for arg in args:
    p = arg.replace('*', '.*')
    if options.verbose: print "Adding pattern %s" % p
    patterns.append(re.compile(p))

search_path = make_splunkhome_path(['etc', 'apps'])
if options.app:
    search_path = make_splunkhome_path(['etc', 'apps', options.app])

for root, dirs, files in os.walk(search_path, topdown=False, followlinks=True):
    for name in files:
        fullPath = os.path.join(root, name)
        if name.endswith('.xml') and all([pattern.search(fullPath) for pattern in patterns]):
            f = open(fullPath, 'r')
            try:
                rootNode = et.parse(f)
                if options.simplexml and rootNode.getroot().tag not in ('dashboard', 'form'):
                    continue
                isValid = schema.validate(rootNode)
                if not isValid:
                    print
                    print "%s INVALID" % fullPath
                    print schema.error_log
                    print
                elif options.verbose:
                    print "%s: VALID" % fullPath
            except:
                print
                print "%s: Error parsing XML" % fullPath
                print
            f.close()
