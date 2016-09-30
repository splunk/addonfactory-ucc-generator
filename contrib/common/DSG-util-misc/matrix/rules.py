# ###############################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
# ###############################################################################
"""
This module provide rules for each questions

Author: Jing Shao(jshao@splunk.com)
Date:    2015/11/19 10:23:06
"""

import subprocess

import config


class RuleFactory(object):
    @staticmethod
    def create_rule(ta_path, index):
        try:
            rule_class_name = "Rule4Item" + str(index) + '(ta_path, config.QUESTIONS[index])'
            rule = eval(rule_class_name)
        except NameError:
            rule = UnknownRule(ta_path, config.QUESTIONS[index])
        return rule


class BaseRule(object):
    def __init__(self, ta_path, question):
        self.question = question
        self.status = config.STATUS_TODO
        self.ta_path = ta_path
        self.rule_list = []
        self.need_assemble = True

    def assemble_rule(self):
        rule = ''
        for single_rule in self.rule_list:
            single_rule = single_rule.strip()
            if single_rule[-1] is not config.COMMAND_DELIMITER:
                single_rule = single_rule + config.COMMAND_DELIMITER
            rule = rule + single_rule % self.ta_path
        return rule

    def check(self):
        if self.need_assemble is True:
            rule = self.assemble_rule()
            p = subprocess.Popen(rule, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            (std_output, err_output) = p.communicate()
            if len(err_output.strip()) != 0:
                print "Check fail for question: %s" % self.question
                print "Ignore, continue"
                pass
            elif len(std_output.strip()) != 0:
                self.status = config.STATUS_TRUE
            else:
                self.status = config.STATUS_FALSE

        return self.status

    def create_result(self):
        check_result = []
        if self.status is config.STATUS_TRUE:
            check_result.append(config.LABEL_CHOSE)
            check_result.append(config.LABEL_PLACEHOLDER)
        elif self.status is config.STATUS_FALSE:
            check_result.append(config.LABEL_PLACEHOLDER)
            check_result.append(config.LABEL_CHOSE)
        else:
            check_result.append(config.LABEL_TODO)
            check_result.append(config.LABEL_TODO)

        return check_result


class UnknownRule(BaseRule):
    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.need_assemble = False
        self.status = config.STATUS_TODO


class PositiveRule(BaseRule):
    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.need_assemble = False
        self.status = config.STATUS_TRUE


class NegativeRule(BaseRule):
    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.need_assemble = False
        self.status = config.STATUS_FALSE


class Rule4Item0(BaseRule):
    """
    This add-on must be deployed to these tiers in order for all functionality included in the add-on to work.
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.check_result = []

    def check(self):
        rule4_item1 = Rule4Item1(self.ta_path, self.question)
        if rule4_item1.check() is config.STATUS_TRUE:
            self.check_result.append(config.LABEL_CHOSE)
        else:
            self.check_result.append(config.LABEL_PLACEHOLDER)

    def create_result(self):
        # Set default to indexer is not chosen and forwarder is chosen
        check_result = [' ', 'X']
        self.check_result.extend(check_result)
        return self.check_result


class Rule4Item1(BaseRule):
    """
    This add-on includes search-time operations:
    Add-ons which set search-time segmentation
    Add-ons which set eventtype matching
    Add-ons which set Search-time field extraction
    Add-ons which set Field aliasing
    Add-ons which set Addition of fields from lookups
    Add-ons which set Source type renaming
    Add-ons which set Tagging
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep props | grep -v \.old | xargs egrep '^SEGMENTATION-' | grep -v '#' | uniq; ")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep eventtypes.conf | xargs egrep '^\[.+\]' | grep -v '#' | uniq;")
        # TODO Add search-time field extraction
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep props | grep -v \.old | xargs egrep 'FIELDALIAS' | grep -v '#'| uniq; ")
        self.rule_list.append(
            "find %s -name '*.csv' | egrep lookups | xargs grep -v '#' | uniq; ")
        # TODO Add external lookup check
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep props | grep -v \.old | xargs egrep '^rename' | grep -v '#' | uniq; ")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep tags | grep -v \.old | xargs egrep '^\[.+\]' | grep -v '#' | uniq; ")

class Rule4Item4(BaseRule):
    """
    index-time operation
    Add-ons which set host field:
    Add-ons which set sourcetype field (ignoring the old school eventgen ones)
    Add-ons which use Indexed Extractions
    Add-ons which assign timestamps
    Add-ons which configure line breaking
    Add-ons which configure index-time event segmentation:"
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep 'inputs|props|transforms' | grep -v \.old | xargs egrep '^host|host::' | egrep -v '_host|host_' | grep -v '#' | uniq; ")
        self.rule_list.append(
             "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs egrep '^sourcetype|sourcetype::' | grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs grep -e ^TRANSFORMS- | grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs egrep '^INDEXED_EXTRACTIONS|FIELD_DELIMITER' | grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs grep -e '^TIME_FORMAT' | grep -v '#' | uniq;")

        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs grep -e ^LINE_BREAKER -e ^SHOULD_LINEMERGE | grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep props | grep -v \.old | xargs grep -e ^SEGMENTATION | grep -v '#' | uniq;")

class Rule4Item3(Rule4Item4):
    """
    "This add-on includes index-time operations and thus must be installed on indexers."
    """

    def __init__(self, ta_path, question):
        Rule4Item4.__init__(self, ta_path, question)

class Rule4Item5(PositiveRule):
    """
    If this add-on is installed on indexers, it supports indexer clusters.
    """

    def __init__(self, ta_path, question):
        PositiveRule.__init__(self, ta_path, question)


class Rule4Item6(BaseRule):
    """
    This add-on includes a data collection component (generally installed on a forwarder in a distributed environment.)
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append("find %s -name 'inputs.conf.spec' | grep README | grep -v \.old | xargs egrep '\[.+\]' | grep -v '#' | awk -F ':' '{print $1}' | sed 's/^\[//' | sed 's/^[ ]*//g' |  sed 's/[ ]*$//g';")
        self.rule_list.append("find %s -name 'inputs.conf'| grep default | grep -v \.old | xargs egrep '\[.+\]' | grep -v '#' | sed 's/\]$//g' | sed 's/\[//g' | sed 's/^[ ]*//g' |  sed 's/[ ]*$//g';")

    def check(self):
        rule = self.assemble_rule()
        p = subprocess.Popen(rule, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        (std_output, err_output) = p.communicate()
        if len(err_output.strip()) != 0:
            print "Check fail for question: %s" % self.question
            print "Ignore, continue"
            return self.status
        stanza_appear_times = {}
        appear_once_more = []
        all_stanzas = std_output.strip().split('\n')
        for stanza in all_stanzas:
            if stanza in stanza_appear_times.keys():
                stanza_appear_times[stanza] += 1
            else:
                stanza_appear_times[stanza] = 1
        for key in stanza_appear_times.keys():
            if stanza_appear_times[key] > 1:
                appear_once_more.append(key)

        if not len(appear_once_more):
            self.status = config.STATUS_FALSE

        for stanza in appear_once_more:
            stanza.strip()
            data_collection_component_file = stanza + "\.*"
            rule = "find %s -name %s | grep bin" % (self.ta_path, data_collection_component_file)
            p = subprocess.Popen(rule, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            (std_output, err_output) = p.communicate()
            if len(err_output.strip()) != 0:
                print "Check fail for question: %s" % self.question
                print "Ignore, continue"
                pass
            elif len(std_output.strip()) != 0:
                self.status = config.STATUS_TRUE
                break
            else:
                self.status = config.STATUS_FALSE
        return self.status


class Rule4Item7(BaseRule):
    """
    The data collection should be configured via Splunk Web UI as a best practice. (Thus a heavy forwarder is strongly
    recommended or required in a distributed environment.)
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append("find %s -name setup.xml | grep -v \.old;")
        self.rule_list.append("find %s -name inputs.conf.spec | grep -v \.old;")
        self.rule_list.append("find %s -type d -name js | grep appserver | grep -v \.old;")
        self.rule_list.append("find %s -type d -name manager | grep ui | grep -v \.old")


class Rule4Item8(PositiveRule):
    """
    The data collection can be configured without using the Splunk Web UI, thus it is possible to use universal or light
    forwarders instead.
    """

    def __init__(self, ta_path, question):
        PositiveRule.__init__(self, ta_path, question)


class Rule4Item10(BaseRule):
    """
    The data collection component of the add-on requires Python, thus a heavy or light forwarder is required and the
    universal forwarder is not supported). (Although the customer can install a Python interpreter herself, this is not
    supported, so do not consider that option.)"
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.py' | egrep bin | grep -v 'splunktalib';")


class Rule4Item11(NegativeRule):
    """
    This add-on requires the search head to be able to communicate to the forwarders (such as with the Splunk App for Stream) and thus is not supported for Splunk Cloud.
    """

    def __init__(self, ta_path, question):
        NegativeRule.__init__(self, ta_path, question)


class Rule4Item12(BaseRule):
    """
    This add-on requires the search head to be able to communicate to the third-party software/technology (such as with a custom command or workflow action) and thus requires that the customer configure their credentials to the third-party technology on the search heads as well as on the forwarders.
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append("find %s -name '*.conf' | grep default | grep commands | grep -v \.old;")
        self.rule_list.append("find %s -name '*.conf' | grep default | grep workflow_actions | grep -v \.old;")


class Rule4Item13(BaseRule):
    """
    This add-on depends on the credential vault to encrypt sensitive data, thus users cannot use a deployment server
    because of known issues propagating credentials across instances with unique client secrets.",
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.py'  | xargs egrep -A5 'TAConfManager' | egrep 'set_encrypt_keys' | grep -v '#'")


class Rule4Item14(BaseRule):
    """
    This add-on uses the KV Store
    1. use configuration file
    2. use rest api
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | egrep 'collections' | grep -v \.old | xargs egrep '\[.+\]'| grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.py' | grep bin | grep -v 'splunktalib' | xargs egrep 'get_state_store\s*\("
            ".+use_kv_store\s*=\s*True\s*\) | grep -v '#' | uniq;")
        self.rule_list.append(
            "find %s -name '*.py' | grep bin | grep -v 'splunktalib' | xargs egrep 'get_state_store\s*\("
            ".+use_kv_store\s*=\s*1\s*\) | grep -v '#' | uniq;")
        # TODO, improve, the dev use variable


class Rule4Item15(BaseRule):
    """
    This add-on includes index definitions
    """

    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.conf' | grep default | grep -v \.old| egrep 'indexes'| xargs grep -v '#' | uniq")


class Rule4Item16(BaseRule):
    def __init__(self, ta_path, question):
        BaseRule.__init__(self, ta_path, question)
        self.rule_list.append(
            "find %s -name '*.py' | grep bin| grep -v 'splunktalib' | xargs egrep 'get_state_store\s*\(' | grep -v '#'")

