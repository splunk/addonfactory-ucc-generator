from splunk_add_on_ucc_framework.commands import build
import os
import pytest
import tempfile
import shutil

TESTDATA_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "testdata")
APP_MANIFEST_PATH = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "testdata", "app.manifest"
)


def get_global_config_files():
    files = []
    for filename in os.listdir(TESTDATA_DIR):
        if filename.startswith("valid_") or filename.startswith("invalid_"):
            files.append(os.path.join(TESTDATA_DIR, filename))
    return files


@pytest.mark.parametrize("config_file", get_global_config_files())
def test_build_addon_from_global_config(config_file, caplog):
    is_valid = os.path.basename(config_file).startswith("valid_")
    if os.path.basename(config_file) in [
        "valid_config.json",
        "valid_config_with_custom_dashboard.json",
        "valid_config_only_custom_dashboard.json",
        "valid_config_logging_with_user_defined_handlers.json",
    ]:
        pytest.skip("As these files need external dependency.")

    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = os.path.join(temp_dir, "package")
        os.makedirs(package_folder, exist_ok=True)

        # Copy the app.manifest to the package folder
        shutil.copy(APP_MANIFEST_PATH, os.path.join(package_folder))

        # Determine target filename for globalConfig
        ext = os.path.splitext(config_file)[1]
        if ext == ".json":
            target_config_name = "globalConfig.json"
        else:
            target_config_name = "globalConfig.yaml"

        # Copy the current globalConfig file to the package folder
        shutil.copy(config_file, os.path.join(temp_dir, target_config_name))

        if is_valid:
            build.generate(source=package_folder)
            # create set comprehension to get all log levels
            cap_log_levels = {i[1] for i in caplog.record_tuples}
            for log_level in cap_log_levels:
                # fail if we have any error logs
                if log_level > 30:
                    assert False, caplog.text
        else:
            with pytest.raises(SystemExit):
                build.generate(source=package_folder)
