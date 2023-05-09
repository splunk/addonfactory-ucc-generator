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


def test_get_addon_name(app_manifest_correct):
    expected_addon_name = "Splunk_TA_UCCExample"
    assert expected_addon_name == app_manifest_correct.get_addon_name()


def test_get_addon_version(app_manifest_correct):
    expected_addon_version = "7.0.1"
    assert expected_addon_version == app_manifest_correct.get_addon_version()


def test_get_title(app_manifest_correct):
    expected_title = "Splunk Add-on for UCC Example"
    assert expected_title == app_manifest_correct.get_title()


def test_get_description(app_manifest_correct):
    expected_description = "Description of Splunk Add-on for UCC Example"
    assert expected_description == app_manifest_correct.get_description()


def test_get_license_name(app_manifest_correct):
    expected_license_name = "Apache-2.0"
    assert expected_license_name == app_manifest_correct.get_license_name()


def test_get_license_uri(app_manifest_correct):
    expected_license_name = "https://www.apache.org/licenses/LICENSE-2.0"
    assert expected_license_name == app_manifest_correct.get_license_uri()


def test_get_authors(app_manifest_correct):
    expected_authors = [
        {
            "name": "Splunk",
            "email": "addonfactory@splunk.com",
            "company": None,
        }
    ]
    assert expected_authors == app_manifest_correct.get_authors()


def test_update_addon_version(app_manifest_correct):
    expected_addon_version = "v1.1.1"
    app_manifest_correct.update_addon_version(expected_addon_version)
    assert (
        expected_addon_version
        == app_manifest_correct._manifest["info"]["id"]["version"]
    )


def test_str(app_manifest_correct):
    expected_content = get_testdata_file("app.manifest_written")
    assert expected_content == str(app_manifest_correct)


def test_validate_when_correct(app_manifest_correct):
    app_manifest_correct.validate()


def test_validate_when_incorrect_schema_version():
    manifest = _get_manifest("app.manifest_incorrect_schema_version")

    with pytest.raises(app_manifest.AppManifestFormatException) as exc_info:
        manifest.validate()
    (msg,) = exc_info.value.args
    assert (
        f"schemaVersion should be '{app_manifest.APP_MANIFEST_SCHEMA_VERSION}'" == msg
    )


def test_validate_when_no_supported_deployments_specified(app_manifest_correct):
    app_manifest_without_supported_deployments = app_manifest_correct
    app_manifest_without_supported_deployments._manifest["supportedDeployments"] = None

    with pytest.raises(app_manifest.AppManifestFormatException) as exc_info:
        app_manifest_without_supported_deployments.validate()
    (msg,) = exc_info.value.args
    assert "supportedDeployments should be set" == msg


def test_validate_when_supported_deployments_are_incorrect(app_manifest_correct):
    app_manifest_without_supported_deployments = app_manifest_correct
    app_manifest_without_supported_deployments._manifest["supportedDeployments"] = [
        "_standalone",
        "foo",
    ]

    with pytest.raises(app_manifest.AppManifestFormatException) as exc_info:
        app_manifest_without_supported_deployments.validate()
    (msg,) = exc_info.value.args
    assert (
        f"supportedDeployments should only have values from '{app_manifest.APP_MANIFEST_SUPPORTED_DEPLOYMENTS}'"
        == msg
    )


def test_validate_when_no_target_workloads_specified(app_manifest_correct):
    app_manifest_without_target_workloads = app_manifest_correct
    app_manifest_without_target_workloads._manifest["targetWorkloads"] = None

    with pytest.raises(app_manifest.AppManifestFormatException) as exc_info:
        app_manifest_without_target_workloads.validate()
    (msg,) = exc_info.value.args
    assert "targetWorkloads should be set" == msg


def test_validate_when_target_workloads_are_incorrect(app_manifest_correct):
    app_manifest_without_target_workloads = app_manifest_correct
    app_manifest_without_target_workloads._manifest["targetWorkloads"] = [
        "_search_heads",
        "foo",
    ]

    with pytest.raises(app_manifest.AppManifestFormatException) as exc_info:
        app_manifest_without_target_workloads.validate()
    (msg,) = exc_info.value.args
    assert (
        f"targetWorkloads should only have values from '{app_manifest.APP_MANIFEST_TARGET_WORKLOADS}'"
        == msg
    )


def test_manifest(app_manifest_correct):
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
        "targetWorkloads": ["_search_heads", "_indexers"],
    }
    assert expected_manifest == app_manifest_correct.manifest
