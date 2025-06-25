import pytest
import subprocess


def install_splunk_appinspect():
    """
    Function to actually imitate that the splunk-appinspect library is present
    """
    subprocess.call("pip install splunk-appinspect", shell=True)


def uninstall_splunk_appinspect():
    """
    Function to actually imitate that the splunk-appinspect library is absent
    """
    subprocess.call("pip uninstall -y splunk_appinspect", shell=True)


def test_validate_when_splunk_appinspect_missing(caplog):
    # Need to make sure appinspect is not installed on the system
    uninstall_splunk_appinspect()
    error_msg = (
        "UCC validate dependencies are not installed. Please install them using the command ->"
        " `pip install splunk-add-on-ucc-framework[validate]`."
    )

    from splunk_add_on_ucc_framework.commands.validate import validate

    with pytest.raises(SystemExit):
        validate("some/path")

    assert error_msg in caplog.text


def test_validate_when_incorrect_path_provided():
    # Test when incorrect addon-path is provided, for that system should exit with exit_code == 2
    install_splunk_appinspect()

    from splunk_add_on_ucc_framework.commands.validate import validate

    with pytest.raises(SystemExit) as se:
        validate("invalid/addon_path")

    assert se.value.code == 2


def test_validate_when_correct_path_provided():
    # Test when correct addon-path is provided, for that system should exit with exit_code == 0
    install_splunk_appinspect()

    from splunk_add_on_ucc_framework.commands.validate import validate

    with pytest.raises(SystemExit) as se:
        validate(
            "tests/testdata/expected_addons/expected_output_global_config_everything/Splunk_TA_UCCExample"
        )

    assert se.value.code == 0
