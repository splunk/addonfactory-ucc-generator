__author__ = 'Zimo'

import smtplib
import base64
import sys
import getopt
from optparse import OptionParser

SENDER = 'no-reply-bamboo@splunk.com'
MARKER = "AUNIQUEMARKER"

# Define the main headers.
PART1 = """From: no-reply-bamboo <no-reply-bamboo@splunk.com>
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=%s
--%s
"""

# Define the message action
PART2 = """Content-Type: text/html
Content-Transfer-Encoding:8bit

%s
--%s
"""

# Define the attachment section
PART3 = """Content-Type: multipart/mixed; name=\"%s\"
Content-Transfer-Encoding:base64
Content-Disposition: attachment; filename=%s

%s
--%s--
"""


def sendEmail(file_path, build_number, TA_name, receivers, testing_build_number=None, link=None):
    try:
        # Read a file and encode it into base64 format
        print "INFO file_path: ", file_path
        print "INFO build_number: ", build_number
        print "INFO testing_build_number: ", testing_build_number
        print "INFO TA_name: ", TA_name
        print "INFO receivers: ", receivers
        print "Testing detail Link: ", link

        fo = open(file_path, 'rb')
        filecontent = ""
        if link:
            filecontent += "Testing Details: " + link
        filecontent += fo.read()
        encodedcontent = base64.b64encode(filecontent)  # base64
        packed_receivers = ""
        for receiver in receivers:
            packed_receivers += receiver +";"
        filename = TA_name +\
                   "--Build-" + build_number +\
                   "--TestingResults"
        message = PART1 % (packed_receivers, filename, MARKER, MARKER) \
                  + PART2 % (filecontent, MARKER) \
                  + PART3 %(filename, filename, encodedcontent, MARKER)

        smtpObj = smtplib.SMTP('mail.sv.splunk.com')
        smtpObj.sendmail(SENDER, receivers, message)
        print "Successfully sent email"
    except Exception:
        print "Error: unable to send email"


if __name__ == '__main__':
    optionParser = OptionParser()
    optionParser.add_option('-f', '--file_path', help="content/attachment file path")
    optionParser.add_option('-b', '--build_number', help="build number for the TA testing on")
    optionParser.add_option('-n', '--testing_build_number', help="build number for TA testing job")
    optionParser.add_option('-t', '--ta_name', help="name of the tested TA")
    optionParser.add_option('-r', '--mail_receivers', help="mail receivers' addresses, "
                                                           "separate by ',' to send to more than one receiver")
    optionParser.add_option('-l', '--link', help="link for testing build details")
    (options, args) = optionParser.parse_args()
    sendEmail(options.file_path, options.build_number, options.ta_name, options.mail_receivers.split(','), options.testing_build_number, options.link)