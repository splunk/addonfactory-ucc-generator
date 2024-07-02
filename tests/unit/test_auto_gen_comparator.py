from splunk_add_on_ucc_framework import auto_gen_comparator
from unittest.mock import MagicMock, _CallList
from helpers import write_content_to_file
import pytest
from typing import List
from lxml import etree, objectify, html


def test_print_files_blank():
    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    obj.common_files = {}
    obj.different_files = {}
    logger = MagicMock()
    obj.print_files(logger)

    assert logger.warning.call_count == 0


def test_print_files_not_blank():
    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    obj.common_files = {"/full/path/to/the/file.ext": "file.ext"}
    obj.different_files = {
        "src_full_file_name::attrib_name": [{"repository": "value", "output": "value"}]
    }
    logger = MagicMock()
    obj.print_files(logger)

    assert logger.warning.call_count == 2
    normalized_diffs = __normalize_output_for_assertion(logger.warning.call_args_list)
    assert obj.COMMON_FILES_MESSAGE_PART_1 in normalized_diffs
    assert obj.COMMON_FILES_MESSAGE_PART_2 in normalized_diffs
    assert obj.DIFFERENT_FILES_MESSAGE in normalized_diffs


def test_deduce_gen_and_custom_content_normal():
    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    auto_gen_comparator.walk = MagicMock()
    logger = MagicMock()

    src_dir = [
        (
            "root",
            ["dir1", "dir2", "dir3"],
            ["file1.conf", "file2.conf", "file3.xml", "file4.html"],
        )
    ]
    dest_dir = [("root", ["dir1", "dir2"], ["file1.conf", "file2.conf"])]

    auto_gen_comparator.walk.side_effect = [src_dir, dest_dir]
    # mock the methods as we don't actually need to call it
    obj._conf_file_diff_checker = MagicMock()  # type: ignore[method-assign]
    obj._xml_file_diff_checker = MagicMock()  # type: ignore[method-assign]

    # here the ignore_file_list contains alert icons or alert script logic
    obj.deduce_gen_and_custom_content(logger=logger)

    # as there are two common .conf files
    assert obj._conf_file_diff_checker.call_count == 2


def test_deduce_gen_and_custom_content_with_ignore_files():
    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    auto_gen_comparator.walk = MagicMock()
    logger = MagicMock()

    src_dir = [
        (
            "root",
            ["dir1", "dir2", "dir3"],
            ["file1.conf", "file2.conf", "file3.xml", "file4.html"],
        )
    ]
    dest_dir = [("root", ["dir1", "dir2"], ["file1.conf", "file2.conf"])]
    auto_gen_comparator.walk.side_effect = [src_dir, dest_dir]
    # mock the methods as we don't actually need to call it
    obj._conf_file_diff_checker = MagicMock()  # type: ignore[method-assign]
    obj._xml_file_diff_checker = MagicMock()  # type: ignore[method-assign]

    # here the ignore_file_list contains alert icons or alert script logic
    obj.deduce_gen_and_custom_content(
        logger=logger, ignore_file_list=["file1.conf", "file2.conf"]
    )

    assert obj.common_files == {}
    assert logger.warning.call_count == 0


@pytest.mark.parametrize(
    ["file_type", "file_content"],
    [
        (
            "xml",
            """<?xml version="1.0" ?>
<nav>
    <view name="inputs"/>
    <view name="configuration" default="true"/>
    <view name="dashboard"/>
    <view name="search"/>
</nav>
""",
        ),
        (
            "conf",
            """##
## SPDX-FileCopyrightText: 2024 Splunk, Inc.
## SPDX-License-Identifier: LicenseRef-Splunk-8-2021
##
##
[example_input_one]
start_by_shell = false
python.version = python3
sourcetype = example:one
interval = 300
disabled = 0
access = public
""",
        ),
    ],
)
def test__xml_file_diff_checker_no_diff(tmp_path, file_type, file_content):
    src_code = dest_code = file_content

    src_path = str(tmp_path / f"src_{file_type}.{file_type}")
    write_content_to_file(src_path, src_code)

    dest_path = str(tmp_path / f"dest_{file_type}.{file_type}")
    write_content_to_file(dest_path, dest_code)

    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    if file_type == "xml":
        obj._xml_file_diff_checker(src_path, dest_path)
    elif file_type == "conf":
        obj._conf_file_diff_checker(src_path, dest_path)

    logger = MagicMock()
    obj.print_files(logger=logger)

    assert bool(obj.common_files)
    assert not bool(obj.different_files)
    assert logger.warning.call_count == 1


@pytest.mark.parametrize(
    ["src_xml", "dest_xml", "expected_diffs"],
    [
        (
            """<?xml version="1.0" ?>
<nav>
    <view name="inputs" custom="blank"/>
    <view name="configuration"/>
    <view name="dashboard"/>
    <view name="search" default="true"/>
</nav>

""",
            """<?xml version="1.0" ?>
<nav>
    <view name="inputs"/>
    <view name="configuration" default="true"/>
    <view name="dashboard"/>
    <view name="search"/>
</nav>

""",
            [
                "Source: {'name': 'inputs', 'custom': 'blank'}, Generated: {'name': 'inputs'}",
                "Source: {'name': 'configuration'}, Generated: {'name': 'configuration', 'default': 'true'}",
                "Source: {'name': 'search', 'default': 'true'}, Generated: {'name': 'search'}",
            ],
        ),
        (
            """<form class="form-horizontal form-complex">
    <div class="control-group">
        <label class="control-label" for="test_alert_account">Enter Account(s) <span class="required">*</span> </label>
        <div class="controls">
            <!-- some custom comment to describe something -->
            <input type="text" name="action.test_alert.param.account" id="test_alert_account" />
            <span class="help-block" style="display: block; position: static; width: auto; margin-left: 0;">
                Enter comma-delimited account(s)
                <a class="external" href="/app/Splunk_TA_snow/configuration" target="_blank" rel="noopener noreferrer">
                    Configure a new account
                </a>
                Reopen this pop-up after creating a new account
            </span>
        </div>
    </div>
</form>

""",
            """<form class="form-horizontal form-complex">
    <div class="control-group">
        <label class="control-label" for="test_alert_account">Enter Account <span class="required">*</span> </label>
        <div class="controls">
            <input type="text" name="action.test_alert.param.account" id="test_alert_account" />
            <span class="help-block">
                Select the account from the dropdown
            </span>
        </div>
    </div>
</form>

""",
            [
                "Source: Enter Account(s), Generated: Enter Account",
                "Source: Enter comma-delimited account(s), Generated: Select the account from the dropdown",
                "Source: {'class': 'help-block', 'style': 'display: block; position: static; width: auto;"
                " margin-left: 0;'}, Generated: {'class': 'help-block'}",
            ],
        ),
    ],
)
def test__xml_file_diff_checker_nav_and_alert(
    tmp_path, src_xml, dest_xml, expected_diffs
):
    src_path = str(tmp_path / "src_xml.xml")
    write_content_to_file(src_path, src_xml)

    dest_path = str(tmp_path / "dest_xml.xml")
    write_content_to_file(dest_path, dest_xml)

    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    obj._xml_file_diff_checker(src_path, dest_path)

    logger = MagicMock()
    obj.print_files(logger=logger)

    assert logger.warning.call_count == 1
    normalized_diffs = __normalize_output_for_assertion(logger.warning.call_args_list)

    for exp_diff in expected_diffs:
        assert exp_diff in normalized_diffs
    # check for the message header in the output
    assert obj.COMMON_FILES_MESSAGE_PART_1 not in normalized_diffs
    assert obj.COMMON_FILES_MESSAGE_PART_2 not in normalized_diffs
    assert obj.DIFFERENT_FILES_MESSAGE in normalized_diffs


def test__conf_file_diff_checker_with_diff(tmp_path):
    src_code = """##
## SPDX-FileCopyrightText: 2024 Splunk, Inc.
## SPDX-License-Identifier: LicenseRef-Splunk-8-2021
##
##
[example_input_one]
start_by_shell = false
python.version = python3
sourcetype = example:one
interval = 300
# mid level comment somewhere
disabled = 0
access = public"""
    dest_code = """
[example_input_one]
python.version = python3
sourcetype = example:one
interval = 300
access = public"""

    src_path = str(tmp_path / "src_conf.conf")
    write_content_to_file(src_path, src_code)

    dest_path = str(tmp_path / "dest_conf.conf")
    write_content_to_file(dest_path, dest_code)

    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    obj._conf_file_diff_checker(src_path, dest_path)

    logger = MagicMock()
    obj.print_files(logger=logger)

    expected_diffs = ["Source: 0, Generated: ", "Source: false, Generated: "]
    normalized_diffs = __normalize_output_for_assertion(logger.warning.call_args_list)

    for exp_diff in expected_diffs:
        assert exp_diff in normalized_diffs
    # check for the message header in the output
    assert obj.COMMON_FILES_MESSAGE_PART_1 not in normalized_diffs
    assert obj.COMMON_FILES_MESSAGE_PART_2 not in normalized_diffs
    assert obj.DIFFERENT_FILES_MESSAGE in normalized_diffs


def __normalize_output_for_assertion(call_list_obj: _CallList) -> List[str]:
    normalized_diffs = []
    for call_arg in call_list_obj:
        # call_arg is a tuple of positional_args and kwargs
        args, _ = call_arg
        # split for joining the messages,
        # we use the 0th element from positional_args tuple as we are writing logs with a single argument
        diffs = args[0].split("\n")
        nested_diffs = []
        for diff in diffs:
            # split for the diffs per file, `\n` is already taken care of in above split
            nested_diffs.extend(diff.split("\t"))
        normalized_diffs.extend(nested_diffs)
    return normalized_diffs


def test_remove_code_comments(tmp_path):
    src_file = str(tmp_path / "test.xml")
    write_content_to_file(
        src_file,
        """<a>
    <b>
        <c attrib="1">some text</c>
        <d>some text</d>
        <e attrib="2">
            <!-- <f> code commented</f> -->
            <f1> other code </f1>
        </e>
    </b>
    <g>
        <!-- simple comment, nothing else -->
    </g>
</a>
""",
    )
    parser = etree.XMLParser(remove_comments=True)
    src_tree = objectify.parse(src_file, parser=parser)
    src_root = src_tree.getroot()
    # remove all the code comments from the XML files, keep changes in-memory
    src_tree = auto_gen_comparator.remove_code_comments("xml", src_root)

    xml_str = html.tostring(src_tree, method="xml", encoding="unicode")

    # code that is part of comment isn't present in the output
    assert "simple comment, nothing else" not in xml_str
    assert "code commented" not in xml_str


@pytest.mark.parametrize(
    ["src_content", "dest_content", "error_in"],
    [
        (
            "<div></div>",
            """<div class="control-group">
    <div class="controls">
        <span class="help-block" style="display: block; position: static; width: auto; margin-left: 0;">
            Scripted REST endpoint to create incident at.
            Format: /api/<API namespace>/<API ID>/<Relative path>.
            Default: /api/namespace/id/path
        </span>
    </div>
</div>
""",
            "dest",
        ),
        (
            """<div class="control-group">
    <div class="controls">
        <span class="help-block" style="display: block; position: static; width: auto; margin-left: 0;">
            Scripted REST endpoint to create incident at.
            Format: /api/<API namespace>/<API ID>/<Relative path>.
            Default: /api/namespace/id/path
        </span>
    </div>
</div>
""",
            "<div></div>",
            "src",
        ),
    ],
)
def test__xml_file_diff_checker_invalid_xml(
    tmp_path, src_content, dest_content, error_in
):
    src_path = str(tmp_path / "src_xml.xml")
    write_content_to_file(src_path, src_content)

    dest_path = str(tmp_path / "dest_xml.xml")
    write_content_to_file(dest_path, dest_content)

    obj = auto_gen_comparator.CodeGeneratorDiffChecker("", "")
    obj._xml_file_diff_checker(src_path, dest_path)

    logger = MagicMock()
    obj.print_files(logger=logger)

    assert logger.warning.call_count == 1
    assert not bool(obj.common_files)
    assert bool(obj.different_files)
    if error_in == "src":
        assert (
            obj.different_files[src_path]["repository"]
            == "invalid XML present. Please update the source code with valid XML."
        )
    elif error_in == "dest":
        assert (
            obj.different_files[src_path]["output"]
            == "invalid XML generated from globalConfig. Ensure necessary characters are escaped."
        )
