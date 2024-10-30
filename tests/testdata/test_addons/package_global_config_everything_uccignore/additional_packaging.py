
from os.path import sep, exists, dirname, realpath, join
from os import remove, system, _exit, WEXITSTATUS

def additional_packaging(ta_name=None):
    """
    `build-ui.sh` builds custom component present in source code and ships them in the output directory
    """
    if exists(
        join(dirname(realpath(__file__)), "build-ui.sh")
    ):
        system("chmod +x ./build-ui.sh")
        return_code = system("./build-ui.sh")
        if return_code != 0:
            _exit(WEXITSTATUS(return_code))

def cleanup_output_files(output_path: str, ta_name: str) -> None:
    """
    prepare a list for the files to be deleted after the source code has been copied to output directory
    """
    files_to_delete = []
    files_to_delete.append(sep.join([output_path, ta_name, "default", "redundant.conf"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "splunk_ta_uccexample_rh_example_input_two.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "example_input_one.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "splunk_ta_uccexample_rh_example_input_one.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "file_does_not_exist.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "default", "nav", "views", "file_copied_from_source_code.xml"]))

    for delete_file in files_to_delete:
        try:
            remove(delete_file)
        except (FileNotFoundError):
            # simply pass if the file doesn't exist
            pass
