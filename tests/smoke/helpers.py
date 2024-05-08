import difflib
import os
from typing import List, Tuple
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
        # remove whitespaces at the end of every line
        actual_file_lines = list(map(str.rstrip, actual_file_lines))
        expected_file_lines = list(map(str.rstrip, expected_file_lines))

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
