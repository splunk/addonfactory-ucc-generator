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
import unittest

from splunk_add_on_ucc_framework import app_manifest
from tests.unit.helpers import get_testdata_file


def get_manifest(file_name: str) -> app_manifest.AppManifest:
    content = get_testdata_file(file_name)
    manifest = app_manifest.AppManifest()
    manifest.read(content)
    return manifest


class AppManifestTest(unittest.TestCase):
    def test_read(self):
        manifest = get_manifest("app.manifest")
        self.assertTrue(isinstance(manifest._manifest, dict))
        self.assertFalse(manifest._comments)

    def test_read_with_comments(self):
        manifest = get_manifest("app.manifest_with_comments")
        self.assertTrue(isinstance(manifest._manifest, dict))
        expected_comments = [
            "# This is a comment.",
            "# We will keep it after modifying this file.",
        ]
        self.assertListEqual(expected_comments, manifest._comments)

    def test_read_with_unsupported_comments_throws_exception(self):
        with self.assertRaises(app_manifest.AppManifestFormatException):
            get_manifest("app.manifest_with_unsupported_comments")

    def test_get_addon_name(self):
        manifest = get_manifest("app.manifest")
        expected_addon_name = "Splunk_TA_UCCExample"
        self.assertEqual(expected_addon_name, manifest.get_addon_name())

    def test_get_title(self):
        manifest = get_manifest("app.manifest")
        expected_title = "Splunk Add-on for UCC Example"
        self.assertEqual(expected_title, manifest.get_title())

    def test_get_description(self):
        manifest = get_manifest("app.manifest")
        expected_description = "Description of Splunk Add-on for UCC Example"
        self.assertEqual(expected_description, manifest.get_description())

    def test_update_addon_version(self):
        manifest = get_manifest("app.manifest")
        expected_addon_version = "v1.1.1"
        manifest.update_addon_version(expected_addon_version)
        self.assertEqual(
            expected_addon_version, manifest._manifest["info"]["id"]["version"]
        )

    def test_str(self):
        manifest = get_manifest("app.manifest")
        expected_content = get_testdata_file("app.manifest_written")
        self.assertEqual(expected_content, str(manifest))

    def test_str_with_comments(self):
        manifest = get_manifest("app.manifest_with_comments")
        expected_content = get_testdata_file("app.manifest_with_comments_written")
        self.assertEqual(expected_content, str(manifest))
