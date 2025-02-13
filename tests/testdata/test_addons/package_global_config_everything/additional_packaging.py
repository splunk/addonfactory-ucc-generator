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
    :param output_path: The path provided in `--output` argument in ucc-gen command or the default output path.
    :param ta_name: The add-on name which is passed as a part of `--addon-name` argument during `ucc-gen init` 
                    or present in app.manifest file of add-on.
    """
    files_to_delete = []
    files_to_delete.append(sep.join([output_path, ta_name, "default", "redundant.conf"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "template_modinput_layout.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "example_one_input_one.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "template_rest_handler_script.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "file_does_not_exist.py"]))
    files_to_delete.append(sep.join([output_path, ta_name, "default", "nav", "views", "file_copied_from_source_code.xml"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "__pycache__", "sum_without_map.cpython-37.pyc"]))
    files_to_delete.append(sep.join([output_path, ta_name, "bin", "__pycache__", "sum.cpython-37.pyc"]))

    for delete_file in files_to_delete:
        try:
            remove(delete_file)
        except (FileNotFoundError):
            # simply pass if the file doesn't exist
            pass