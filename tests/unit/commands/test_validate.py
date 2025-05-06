import pytest
import subprocess
import sys


def install_splunk_appinspect():
    """
    Functions to actually imitate that the splunk-appinspect library is present
    """
    subprocess.call("pip install splunk-appinspect", shell=True)


def uninstall_splunk_appinspect():
    """
    Functions to actually imitate that the splunk-appinspect library is absent
    """
    subprocess.call("pip uninstall -y splunk_appinspect", shell=True)


def test_validate_when_python_less_than_39(caplog):
    # Exits the system with an error message if python version used is less than 3.9.
    if sys.version_info < (3, 9, 0):
        expected_msg = "The `ucc-gen validate` command isn't supported for versions below Python 3.9. "
        "Please update the Python interpreter to Python 3.9 or above."
        from splunk_add_on_ucc_framework.commands.validate import validate

        with pytest.raises(SystemExit):
            validate("some/path")
        assert expected_msg in caplog.text


@pytest.mark.skipif(sys.version_info < (3, 9), reason="Requires Python 3.9 or higher")
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


@pytest.mark.skipif(sys.version_info < (3, 9), reason="Requires Python 3.9 or higher")
def test_validate_when_incorrect_path_provided():
    # Test when incorrect addon-path is provided, for that system should exit with exit_code == 2
    install_splunk_appinspect()

    from splunk_add_on_ucc_framework.commands.validate import validate

    with pytest.raises(SystemExit) as se:
        validate("invalid/addon_path")

    assert se.value.code == 2


@pytest.mark.skipif(sys.version_info < (3, 9), reason="Requires Python 3.9 or higher")
def test_validate_when_correct_path_provided():
    # Test when correct addon-path is provided, for that system should exit with exit_code == 0
    install_splunk_appinspect()

    from splunk_add_on_ucc_framework.commands.validate import validate

    with pytest.raises(SystemExit) as se:
        validate(
            "tests/testdata/expected_addons/expected_output_global_config_everything/Splunk_TA_UCCExample"
        )

    assert se.value.code == 0
