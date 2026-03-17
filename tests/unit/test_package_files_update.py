from splunk_add_on_ucc_framework.package_files_update import handle_package_files_update


def test_package_files_update_noop(tmp_path):
    handle_package_files_update(str(tmp_path))
