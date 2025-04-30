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
    """
    Compare the contents of two files and return a list of differences.

    Args:
        actual_file_path (str): Path to the actual file .
        expected_file_path (str): Path to the expected file.
        file_mode (str): Mode for reading the file. Use 'rb' for binary and 'r' for text. Default is 'r'.

    Returns:
        List[str]: List of unified diff lines if differences are found, otherwise empty.
    """
    diff_results = []

    with open(expected_file_path, file_mode) as expected_file:
        expected_file_lines = expected_file.readlines()
    with open(actual_file_path, file_mode) as actual_file:
        actual_file_lines = actual_file.readlines()

    if file_mode == "rb":
        # Binary file comparison (e.g., images, icons)
        # Direct byte-level comparison since structured diffing isn't meaningful
        expected_file_content = (
            b"".join(expected_file_lines)
            if expected_file_lines and isinstance(expected_file_lines[0], bytes)
            else b""
        )
        actual_file_content = (
            b"".join(actual_file_lines)
            if actual_file_lines and isinstance(actual_file_lines[0], bytes)
            else b""
        )

        if expected_file_content != actual_file_content:
            diff_results.append(
                f"Binary diff found. Please manually check: {actual_file_path} vs {expected_file_path}"
            )
    else:
        # Normalize line endings, expand tabs, and trim trailing whitespace
        def normalize_lines(lines):
            return [
                line.expandtabs(4).rstrip().replace("\r\n", "\n").replace("\r", "\n")
                for line in lines
            ]

        actual_file_lines = normalize_lines(actual_file_lines)
        expected_file_lines = normalize_lines(expected_file_lines)

        # Generate unified diff for text files
        for line in difflib.unified_diff(
            actual_file_lines,
            expected_file_lines,
            fromfile=actual_file_path,
            tofile=expected_file_path,
            lineterm="",
        ):
            diff_results.append(line)

    return diff_results
