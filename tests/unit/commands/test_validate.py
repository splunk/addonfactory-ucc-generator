import pytest
import sys
import importlib
from unittest.mock import patch

from splunk_add_on_ucc_framework.commands.validate import validate


def test_validate_when_incorrect_path_provided(caplog):
    with pytest.raises(SystemExit):
        validate("invalid/file_path")


@patch.dict(sys.modules, {"splunk_appinspect": None})
def test_import_error(caplog):
    caplog.set_level("ERROR", logger="ucc_gen")
    error_msg = (
        "UCC validate dependencies are not installed. Please install them using the command ->"
        " `pip install splunk-add-on-ucc-framework[validate]`."
    )

    with pytest.raises(SystemExit) as e:
        import splunk_add_on_ucc_framework.commands.validate

        importlib.reload(splunk_add_on_ucc_framework.commands.validate)
    assert error_msg in caplog.text
    assert e.value.code == 1
