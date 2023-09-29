import difflib
import os
from typing import List, Tuple


def compare_file_content(
    files_to_be_equal: List[Tuple[str, ...]],
    expected_folder: str,
    actual_folder: str,
) -> None:
    diff_results = []
    for f in files_to_be_equal:
        expected_file_path = os.path.join(expected_folder, *f)
        actual_file_path = os.path.join(actual_folder, *f)
        with open(expected_file_path) as expected_file:
            expected_file_lines = expected_file.readlines()
        with open(actual_file_path) as actual_file:
            actual_file_lines = actual_file.readlines()
        for line in difflib.unified_diff(
            actual_file_lines,
            expected_file_lines,
            fromfile=actual_file_path,
            tofile=expected_file_path,
            lineterm="",
        ):
            diff_results.append(line)
    if diff_results:
        for result in diff_results:
            print(result)
        assert False, "Some diffs were found"
