
import os
from pathlib import Path
from splunk_add_on_ucc_framework import app_manifest
from splunk_add_on_ucc_framework.commands.openapi_generator import json_to_object, ucc_object
from splunk_add_on_ucc_framework.commands.openapi_generator.ucc_to_oas import transform
from tests.unit import helpers

class TestUccToOas:

    def test_ucc_to_oas(self):

        TEST_DIR = os.path.dirname(os.path.abspath(__file__))
        project_root_dir_path = Path(TEST_DIR).parent.parent
        
        ucc_generator_example_dir_path = project_root_dir_path / "example"
        oas = transform(ucc_project_path=ucc_generator_example_dir_path)

        ucc_generator_package_global_config_configuration = project_root_dir_path / "tests/testdata/test_addons/package_global_config_configuration"
        oas = transform(ucc_project_path=ucc_generator_package_global_config_configuration)
        
        ucc_generator_package_global_config_inputs_configuration_alerts = project_root_dir_path / "tests/testdata/test_addons/package_global_config_inputs_configuration_alerts"
        oas = transform(ucc_project_path=ucc_generator_package_global_config_inputs_configuration_alerts)

        valid_config_json = helpers.get_testdata_file_path("valid_config.json")
        app_manifest_file = helpers.get_testdata_file_path("app.manifest")
        valid_config = ucc_object.GlobalConfig(json_path=Path(valid_config_json))
        app_manifest_object = ucc_object.AppManifest(json_path=Path(app_manifest_file))
        oas = transform(ucc_project_path=None, global_config=valid_config,app_manifest=app_manifest_object)

        app_manifest_with_comments_file = helpers.get_testdata_file_path("app.manifest_with_comments")
        with open(app_manifest_with_comments_file) as manifest_file:
            app_manifest_content = manifest_file.read()
        manifest = app_manifest.AppManifest()
        manifest.read(app_manifest_content)

        app_manifest_object = json_to_object.DataClasses(json=manifest.manifest)
        oas = transform(ucc_project_path=None, global_config=valid_config,app_manifest=app_manifest_object)

        assert 1 == 1