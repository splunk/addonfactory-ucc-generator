#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import configparser
import io
import unittest

from splunk_add_on_ucc_framework.alert_utils.alert_utils_common import (
    conf_parser,
)


class TABConfigParserTest(unittest.TestCase):
    def test_read(self):
        conf = """
#
# Very big copyright comment.
#
[source]
# This is a very simple field aliasing.
FIELDALIAS-field1 = field2 AS field1
EVAL-field3 = case(isnotnull(field4), "success",\
                   isnotnull(field5), "failure")

[sourcetype:deprecated]
EVAL-deprecated_field = "old_value"

[eventtype=some_eventtype]
tag = enabled
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        self.assertEqual(parser.get("source", "FIELDALIAS-field1"), "field2 AS field1")
        self.assertEqual(
            parser.get("source", "EVAL-field3"),
            'case(isnotnull(field4), "success",                   isnotnull(field5), "failure")',
        )
        self.assertEqual(
            parser.get("sourcetype:deprecated", "EVAL-deprecated_field"), '"old_value"'
        )
        self.assertEqual(parser.get("eventtype=some_eventtype", "tag"), "enabled")

    def test_read_incorrect_conf(self):
        conf = """
[source]
# This is a very simple field aliasing.
FIELDALIAS-field1 = field2 AS field1
EVAL-field3 = case(isnotnull(field4), "success",
                   isnotnull(field5), "failure")
"""
        parser = conf_parser.TABConfigParser()
        with self.assertRaises(configparser.ParsingError):
            parser.read_string(conf)

    def test_write(self):
        conf = """
#
# Very big copyright comment.
#
[source]
# This is a very simple field aliasing.
FIELDALIAS-field1 = field2 AS field1
EVAL-field3 = case(isnotnull(field4), "success",\
                   isnotnull(field5), "failure")

[sourcetype:deprecated]
EVAL-deprecated_field = "old_value"

[eventtype=some_eventtype]
tag = enabled
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        output = io.StringIO()
        parser.write(output)
        expected_output = conf + "\n"
        self.assertEqual(expected_output, output.getvalue())

    def test_items(self):
        conf = """
#
# Very big copyright comment.
#
[source]
# This is a very simple field aliasing.
FIELDALIAS-field1 = field2 AS field1
EVAL-field3 = case(isnotnull(field4), "success",\
                   isnotnull(field5), "failure")

[sourcetype:deprecated]
EVAL-deprecated_field = "old_value"

[eventtype=some_eventtype]
tag1 = enabled
tag2 = enabled
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        expected_items = [
            ("__name__", "eventtype=some_eventtype"),
            ("tag1", "enabled"),
            ("tag2", "enabled"),
        ]
        self.assertEqual(expected_items, parser.items("eventtype=some_eventtype"))

    def test_options(self):
        conf = """
# Comment
[source]
EVAL-field1 = "field1"  # please pay attention to this extraction
FIELDALIAS-field2 = field3 AS field2

[not_used_sourcetype]
EVAL-field1 = "field1"
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        expected_options = ["__name__", "EVAL-field1", "FIELDALIAS-field2"]
        self.assertEqual(expected_options, parser.options("source"))

    def test_item_dict(self):
        conf = """
#
# Very big copyright comment.
#
[source]
# This is a very simple field aliasing.
FIELDALIAS-field1 = field2 AS field1
EVAL-field3 = case(isnotnull(field4), "success",\
                   isnotnull(field5), "failure")

[sourcetype:deprecated]
EVAL-deprecated_field = "old_value"

[eventtype=some_eventtype]
tag1 = enabled
tag2 = enabled
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        expected_item_dict = {
            "source": {
                "FIELDALIAS-field1": "field2 AS field1",
                "EVAL-field3": 'case(isnotnull(field4), "success",                   isnotnull(field5), "failure")',
            },
            "sourcetype:deprecated": {
                "EVAL-deprecated_field": '"old_value"',
            },
            "eventtype=some_eventtype": {
                "tag1": "enabled",
                "tag2": "enabled",
            },
        }
        self.assertEqual(expected_item_dict, parser.item_dict())

    def test_remove_existing_section(self):
        conf = """
# Comment
[source]
EVAL-field1 = "field1"  # please pay attention to this extraction
FIELDALIAS-field2 = field3 AS field2

[not_used_sourcetype]
EVAL-field1 = "field1"
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        parser.remove_section("not_used_sourcetype")

    def test_remove_section_that_does_not_exist(self):
        conf = """
# Comment
[source]
EVAL-field1 = "field1"  # please pay attention to this extraction
FIELDALIAS-field2 = field3 AS field2

[not_used_sourcetype]
EVAL-field1 = "field1"
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        parser.remove_section("does_not_exist")

    def test_add_remove_section(self):
        conf = """
# Comment
[source]
EVAL-field1 = "field1"  # please pay attention to this extraction
FIELDALIAS-field2 = field3 AS field2

[not_used_sourcetype]
EVAL-field1 = "field1"
"""
        parser = conf_parser.TABConfigParser()
        parser.read_string(conf)
        parser.add_section("useless_section")
        parser.set("useless_section", "deprecated_tag", "enabled")
        self.assertEqual(parser.get("useless_section", "deprecated_tag"), "enabled")
        parser.remove_section("useless_section")
