import pytest

from splunk_add_on_ucc_framework import app_manifest
from tests.unit.helpers import get_testdata_file


def get_manifest(file_name: str) -> app_manifest.AppManifest:
    content = get_testdata_file(file_name)
    manifest = app_manifest.AppManifest()
    manifest.read(content)
    return manifest


def test_read():
    manifest = get_manifest("app.manifest")
    assert isinstance(manifest._manifest, dict)
    assert not manifest._comments


def test_read_with_comments():
    manifest = get_manifest("app.manifest_with_comments")
    assert isinstance(manifest._manifest, dict)
    expected_comments = [
        "# This is a comment.",
        "# We will keep it after modifying this file.",
    ]
    assert expected_comments == manifest._comments


def test_read_with_unsupported_comments_throws_exception():
    with pytest.raises(app_manifest.AppManifestFormatException):
        get_manifest("app.manifest_with_unsupported_comments")


def test_get_addon_name():
    manifest = get_manifest("app.manifest")
    expected_addon_name = "Splunk_TA_UCCExample"
    assert expected_addon_name == manifest.get_addon_name()


def test_get_title():
    manifest = get_manifest("app.manifest")
    expected_title = "Splunk Add-on for UCC Example"
    assert expected_title == manifest.get_title()


def test_get_description():
    manifest = get_manifest("app.manifest")
    expected_description = "Description of Splunk Add-on for UCC Example"
    assert expected_description == manifest.get_description()


def test_get_license_name():
    manifest = get_manifest("app.manifest")
    expected_license_name = "Apache-2.0"
    assert expected_license_name == manifest.get_license_name()


def test_get_license_uri():
    manifest = get_manifest("app.manifest")
    expected_license_name = "https://www.apache.org/licenses/LICENSE-2.0"
    assert expected_license_name == manifest.get_license_uri()


def test_get_authors():
    manifest = get_manifest("app.manifest")
    expected_authors = [
        {
            "name": "Splunk",
            "email": "addonfactory@splunk.com",
            "company": None,
        }
    ]
    assert expected_authors == manifest.get_authors()


def test_update_addon_version():
    manifest = get_manifest("app.manifest")
    expected_addon_version = "v1.1.1"
    manifest.update_addon_version(expected_addon_version)
    assert expected_addon_version == manifest._manifest["info"]["id"]["version"]


def test_str():
    manifest = get_manifest("app.manifest")
    expected_content = get_testdata_file("app.manifest_written")
    assert expected_content == str(manifest)


def test_str_with_comments():
    manifest = get_manifest("app.manifest_with_comments")
    expected_content = get_testdata_file("app.manifest_with_comments_written")
    assert expected_content == str(manifest)
