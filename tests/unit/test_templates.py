import importlib.util
import sys
from textwrap import dedent
from unittest.mock import MagicMock

import pytest

from splunk_add_on_ucc_framework import utils


class Script:
    pass


@pytest.mark.parametrize("with_self", [True, False])
def test_input_helpers(tmp_path, monkeypatch, with_self):
    # To avoid issues with imports, we need to monkeypatch the sys.modules with a different dict
    monkeypatch.setattr(sys, "modules", {k: v for k, v in sys.modules.items()})

    content = (
        utils.get_j2_env()
        .get_template("input.template")
        .render(
            input_name="MyInput",
            class_name="MyClass",
            description="My Input Description",
            entity=[],
            input_helper_module="my_input_helper",
        )
    )

    (tmp_path / "my_input.py").write_text(content)

    if with_self:
        self_arg = "self, "
    else:
        self_arg = ""

    (tmp_path / "my_input_helper.py").write_text(
        dedent(
            f"""
            def validate_input({self_arg}definition):
                return definition


            def stream_events({self_arg}inputs, event_writer):
                return inputs, event_writer
            """
        )
    )

    for module in ["import_declare_test"]:
        # mock module in sys.modules - set to MagicMock
        mock_module = MagicMock()
        mock_module.__file__ = str(tmp_path / f"{module}.py")
        monkeypatch.setitem(sys.modules, module, mock_module)

    monkeypatch.syspath_prepend(str(tmp_path))
    my_obj = importlib.import_module("my_input").MyClass()

    assert my_obj.validate_input("arg1") == "arg1"
    assert my_obj.stream_events("arg1", "arg2") == ("arg1", "arg2")
