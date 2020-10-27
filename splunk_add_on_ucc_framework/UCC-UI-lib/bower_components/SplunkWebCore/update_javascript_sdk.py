# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

import os
import sys
import urllib2

# Only run this script if the search_mrsparkle directory exists here
if not os.path.isdir("search_mrsparkle"):
    print "Couldn't find the search_mrsparkle dir, assuming this is the wrong folder."
    sys.exit()


# URLs for splunk/splunk-sdk-javascript on GitHub
github_raw_url = "https://raw.githubusercontent.com/splunk/splunk-sdk-javascript"
github_branch_name = "master"
splunk_js_url = "/".join([github_raw_url, github_branch_name, "client/splunk.js"])
splunk_js_min_url = "/".join([github_raw_url, github_branch_name, "client/splunk.min.js"])

base_js_path = os.path.sep.join([os.path.abspath(os.path.dirname(__file__)), "search_mrsparkle", "exposed", "js"])

# File paths to update
js_contrib_path = os.path.sep.join([base_js_path, "contrib"])
js_splunkjs_path = os.path.sep.join([base_js_path, "splunkjs"])

try :
    # Update splunk.js
    print "Trying to download splunk.js from GitHub"
    splunk_js = urllib2.urlopen(splunk_js_url).read()
    print "\t success!"
    print "Trying to update splunk.js in %s" % js_contrib_path
    splunk_js_file = open(os.path.sep.join([js_contrib_path, "splunk.js"]), "w")
    splunk_js_file.write(splunk_js)
    splunk_js_file.close()
    print "\t success!"
    print "Trying to update splunk.js in %s" % js_splunkjs_path
    splunk_js_file = open(os.path.sep.join([js_splunkjs_path, "splunk.js"]), "w")
    splunk_js_file.write(splunk_js)
    splunk_js_file.close()
    print "\t success!"

    # Update splunk.min.js
    print "Trying to download splunk.min.js from GitHub"
    splunk_js = urllib2.urlopen(splunk_js_min_url).read()
    print "\t success!"
    print "Trying to update splunk.min.js in %s" % js_contrib_path
    splunk_js_file = open(os.path.sep.join([js_contrib_path, "splunk.min.js"]), "w")
    splunk_js_file.write(splunk_js)
    splunk_js_file.close()
    print "\t success!"
    print "Trying to update splunk.min.js in %s" % js_splunkjs_path
    splunk_js_file = open(os.path.sep.join([js_splunkjs_path, "splunk.min.js"]), "w")
    splunk_js_file.write(splunk_js)
    splunk_js_file.close()
    print "\t success!"

    # If not exceptions, everything is complete
    print "Everything completed successfully!"
except urllib2.URLError as ul2e:
    print "Error trying to download splunk-sdk-javascript files from GitHub: \n\t %s" % ul2e
except IOError as ioe:
    print "Error trying to write splunk.js and/or splunk.min.js : \n\t %s" % ioe
except Error as e:
    print "Unexpected error %s" % e