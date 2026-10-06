from unittest.mock import patch

import pytest

from splunk_add_on_ucc_framework.generators.conf_files import (
    AlertActionsConf,
    CommandsConf,
    InputsConf,
    RestMapConf,
)


@pytest.mark.parametrize(
    "generator_class, config_fixture",
    [
        (InputsConf, "global_config_all_json"),
        (RestMapConf, "global_config_all_json"),
        (CommandsConf, "global_config_all_json"),
        (AlertActionsConf, "global_config_for_alerts"),
    ],
)
@pytest.mark.parametrize("supported_versions", [[], ["3.9", "3.13"]])
def test_python_version_metadata_controls_generated_conf(
    request, generator_class, config_fixture, supported_versions, input_dir, output_dir
):
    config = request.getfixturevalue(config_fixture)
    config.meta["pythonVersion"] = "python3"
    config.meta["supportedPythonVersion"] = supported_versions

    with patch("shutil.copy"):
        conf = generator_class(config, input_dir, output_dir).generate_conf()

    assert conf is not None
    lines = conf["content"].splitlines()
    python_version_lines = [line for line in lines if line.startswith("python.version")]
    python_required_lines = [
        line for line in lines if line.startswith("python.required")
    ]

    assert python_version_lines
    assert python_version_lines == ["python.version = python3"] * len(
        python_version_lines
    )
    assert python_required_lines == ["python.required = 3.9, 3.13"] * (
        len(python_version_lines) if supported_versions else 0
    )
