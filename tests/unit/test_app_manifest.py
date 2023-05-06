import pytest

from splunk_add_on_ucc_framework import app_manifest
from tests.unit.helpers import get_testdata_file


def _get_manifest(file_name: str) -> app_manifest.AppManifest:
    content = get_testdata_file(file_name)
    manifest = app_manifest.AppManifest()
    manifest.read(content)
    return manifest


def test_read_when_could_not_parse_the_file_but_no_comments():
    with pytest.raises(app_manifest.AppManifestFormatException):
        # The file content is not proper JSON file, it has "," in the end of
        # the file.
        _get_manifest("app.manifest_without_comments.broken")


def test_read_with_comments():
    with pytest.raises(app_manifest.AppManifestFormatException):
        # The app.manifest file has comments, not supported anymore.
        _get_manifest("app.manifest_with_comments")


def test_get_addon_name():
    manifest = _get_manifest("app.manifest")
    expected_addon_name = "Splunk_TA_UCCExample"
    assert expected_addon_name == manifest.get_addon_name()


def test_get_title():
    manifest = _get_manifest("app.manifest")
    expected_title = "Splunk Add-on for UCC Example"
    assert expected_title == manifest.get_title()


def test_get_description():
    manifest = _get_manifest("app.manifest")
    expected_description = "Description of Splunk Add-on for UCC Example"
    assert expected_description == manifest.get_description()


def test_get_license_name():
    manifest = _get_manifest("app.manifest")
    expected_license_name = "Apache-2.0"
    assert expected_license_name == manifest.get_license_name()


def test_get_license_uri():
    manifest = _get_manifest("app.manifest")
    expected_license_name = "https://www.apache.org/licenses/LICENSE-2.0"
    assert expected_license_name == manifest.get_license_uri()


def test_get_authors():
    manifest = _get_manifest("app.manifest")
    expected_authors = [
        {
            "name": "Splunk",
            "email": "addonfactory@splunk.com",
            "company": None,
        }
    ]
    assert expected_authors == manifest.get_authors()


def test_update_addon_version():
    manifest = _get_manifest("app.manifest")
    expected_addon_version = "v1.1.1"
    manifest.update_addon_version(expected_addon_version)
    assert expected_addon_version == manifest._manifest["info"]["id"]["version"]


def test_str():
    manifest = _get_manifest("app.manifest")
    expected_content = get_testdata_file("app.manifest_written")
    assert expected_content == str(manifest)


def test_manifest():
    manifest = _get_manifest("app.manifest")

    expected_manifest = {
        "schemaVersion": "2.0.0",
        "info": {
            "title": "Splunk Add-on for UCC Example",
            "id": {"group": None, "name": "Splunk_TA_UCCExample", "version": "7.0.1"},
            "author": [
                {"name": "Splunk", "email": "addonfactory@splunk.com", "company": None}
            ],
            "releaseDate": None,
            "description": "Description of Splunk Add-on for UCC Example",
            "classification": {
                "intendedAudience": None,
                "categories": [],
                "developmentStatus": None,
            },
            "commonInformationModels": None,
            "license": {
                "name": "Apache-2.0",
                "text": "LICENSES/Apache-2.0.txt",
                "uri": "https://www.apache.org/licenses/LICENSE-2.0",
            },
            "privacyPolicy": {"name": None, "text": None, "uri": None},
            "releaseNotes": {"name": None, "text": "./README.txt", "uri": None},
        },
        "dependencies": None,
        "tasks": None,
        "inputGroups": None,
        "incompatibleApps": None,
        "platformRequirements": None,
        "supportedDeployments": ["_standalone", "_distributed"],
        "targetWorkloads": None,
    }
    assert expected_manifest == manifest.manifest
