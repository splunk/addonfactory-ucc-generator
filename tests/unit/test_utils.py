import datetime
from unittest import mock

import dunamai
import pytest

from splunk_add_on_ucc_framework import exceptions, utils


def test_get_j2_env():
    j2_env = utils.get_j2_env()

    list_of_templates = j2_env.list_templates(extensions="template")

    expected_list_of_templates = [
        "input.template",
        "input_with_helper.template",
        "oauth.template",
        "html_templates/alert_html_skeleton.template",
        "html_templates/mod_alert.html.template",
        "README/account_conf_spec.template",
        "README/alert_actions_conf_spec.template",
        "README/inputs_conf_spec.template",
        "README/settings_conf_spec.template",
        "conf_files/alert_actions_conf.template",
        "conf_files/app_conf.template",
        "conf_files/eventtypes_conf.template",
        "conf_files/inputs_conf.template",
        "conf_files/restmap_conf.template",
        "conf_files/server_conf.template",
        "conf_files/settings_conf.template",
        "conf_files/tags_conf.template",
        "conf_files/web_conf.template",
    ]
    assert sorted(expected_list_of_templates) == sorted(list_of_templates)


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version", autospec=True)
def test_get_version_from_git_when_runtime_error_from_dunamai(mock_version_class):
    mock_version_class.from_git.side_effect = RuntimeError

    with pytest.raises(exceptions.IsNotAGitRepo):
        utils.get_version_from_git()


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version", autospec=True)
def test_get_version_from_git_when_tags_are_not_semver(mock_version_class):
    mock_version = mock.MagicMock()
    mock_version.serialize.side_effect = ValueError
    mock_version_class.from_git.return_value = mock_version

    with pytest.raises(exceptions.CouldNotVersionFromGitException):
        utils.get_version_from_git()


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version.from_git", autospec=True)
def test_get_version_from_git_when_(mock_version_from_git):
    version = dunamai.Version("2.2.1", stage=("b", 2), distance=16, commit="2e0d120")
    mock_version_from_git.return_value = version

    expected_result = "2.2.1b2e0d120"
    assert expected_result == utils.get_version_from_git()


@mock.patch("splunk_add_on_ucc_framework.utils.dunamai.Version.from_git", autospec=True)
def test_get_version_from_git_when_stage_is_none(mock_version_from_git):
    version = dunamai.Version(
        base="5.25.0",
        stage=None,
        distance=11,
        commit="391ec865",
        dirty=True,
        tagged_metadata=None,
        epoch=None,
        branch="foo",
        timestamp=datetime.datetime(
            2023, 4, 26, 14, 42, 12, tzinfo=datetime.timezone.utc
        ),
    )
    mock_version_from_git.return_value = version

    expected_result = "5.25.0+391ec865"
    assert expected_result == utils.get_version_from_git()


def test_dump_json_config(tmp_path):
    tmp_file_to_dump = tmp_path / "globalConfig.json"
    config = {"hello": "world", "test": "config_to_dump"}

    utils.dump_json_config(config, str(tmp_file_to_dump))

    # Due to usage of end-of-line check in the add-on's repositories,
    # we need to ensure that the empty line is being added to the end of the
    # file, otherwise it conflicts with `pre-commit` configuration and
    # `pre-commit` tries to add it again before commit.
    expected_content = """{
    "hello": "world",
    "test": "config_to_dump"
}
"""

    with open(tmp_file_to_dump) as f:
        content = f.read()

    assert expected_content == content


def test_dump_yaml_config(tmp_path):
    tmp_file_to_dump = tmp_path / "globalConfig.yaml"
    config = {
        "hello": "world",
        "test": "config_to_dump",
        "afoo": "bar",
    }

    utils.dump_yaml_config(config, str(tmp_file_to_dump))

    expected_content = "hello: world\ntest: config_to_dump\nafoo: bar\n"

    with open(tmp_file_to_dump) as f:
        content = f.read()

    assert expected_content == content
