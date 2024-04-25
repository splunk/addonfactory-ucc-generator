import difflib
import os
from typing import List, Tuple
from shutil import copy2
from pathlib import Path
import xmldiff.main


def compare_file_content(
    files_to_be_equal: List[Tuple[str, ...]],
    expected_folder: str,
    actual_folder: str,
) -> None:
    diff_results = []
    for f in files_to_be_equal:
        expected_file_path = os.path.join(expected_folder, *f)
        actual_file_path = os.path.join(actual_folder, *f)

        if f[-1].endswith(".xml"):
            diff_results.extend(_compare_xml(actual_file_path, expected_file_path))
        elif f[-1].endswith(".png"):
            diff_results.extend(
                _compare_content(actual_file_path, expected_file_path, "rb")
            )
        else:
            diff_results.extend(_compare_content(actual_file_path, expected_file_path))
    if diff_results:
        for result in diff_results:
            print(result)
        assert False, "Some diffs were found"


def _compare_xml(actual_file_path: str, expected_file_path: str) -> List[str]:
    diff = xmldiff.main.diff_files(expected_file_path, actual_file_path)

    if diff:
        return [str(item) for item in diff]

    return []


def _compare_content(
    actual_file_path: str, expected_file_path: str, file_mode: str = "r"
) -> List[str]:
    # we let Python pick the file mode (rb or rt) by specifying the default 'r'
    diff_results = []

    with open(expected_file_path, file_mode) as expected_file:
        expected_file_lines = expected_file.readlines()
    with open(actual_file_path, file_mode) as actual_file:
        actual_file_lines = actual_file.readlines()
    if file_mode == "rb":
        # custom implementation to compare files like icons, logos present in an
        # add-on without using libraries like scipy and numpy
        expected_file_lines_str = "".join([str(i) for i in expected_file_lines])
        actual_file_lines_str = "".join([str(i) for i in expected_file_lines])
        if expected_file_lines_str != actual_file_lines_str:
            diff_results.append(
                f"Diff found, please check the files {actual_file_path} "
                f"and {expected_file_path} manually for the difference."
            )
    else:
        # for everything else, we use the library
        for line in difflib.unified_diff(
            actual_file_lines,
            expected_file_lines,
            fromfile=actual_file_path,
            tofile=expected_file_path,
            lineterm="",
        ):
            diff_results.append(line)

    return diff_results


def _create_everything_uccignore_dir(tmp_dest_dir_name: str) -> None:
    def __copy_files(
        source_dir: str, destination_dir: str, ignore_files: List[str] = []
    ) -> None:
        # Walk through the source directory
        for root, dirs, files in os.walk(source_dir):
            # Create corresponding directories in the destination directory
            for directory in dirs:
                source_directory = os.path.join(root, directory)
                destination_directory = source_directory.replace(
                    source_dir, destination_dir
                )
                if not os.path.exists(destination_directory):
                    os.makedirs(destination_directory)

            # Copy files to corresponding destination directories
            for file in files:
                if file in ignore_files:
                    continue
                source_file = os.path.join(root, file)
                destination_file = source_file.replace(source_dir, destination_dir)
                copy2(source_file, destination_file)  # copy2 preserves file metadata

    src_path = Path(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_everything",
            "Splunk_TA_UCCExample",
        )
    )

    ignore_files = [
        "test icon.png",
        "myAlertLogic.py",
        "alert_actions.conf",
        "test_alert.py",
    ]
    __copy_files(
        source_dir=str(src_path),
        destination_dir=tmp_dest_dir_name,
        ignore_files=ignore_files,
    )

    for af in ignore_files:
        expected_file_path = os.path.join(tmp_dest_dir_name, *af)
        assert not os.path.exists(expected_file_path)

    src_path_uccignore = Path(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_everything_uccignore",
            "Splunk_TA_UCCExample",
        )
    )
    __copy_files(source_dir=str(src_path_uccignore), destination_dir=tmp_dest_dir_name)
