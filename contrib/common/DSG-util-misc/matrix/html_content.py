################################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
################################################################################
"""
This module provide  html format table content generated from template

Author: Jing Shao(jshao@splunk.com)
Date:    2015/11/19 10:25:08
"""

import config


class HtmlContent(object):
    def __init__(self, check_result):
        self.result = check_result
        self.html = config.HTML_TEMPLATE

    def generate(self):
        for item in self.result:
            self.html = self.html.replace(config.LABEL_UNKNOWN, item, 1)
        return self.html
