import os
from pathlib import Path
from splunk_add_on_ucc_framework.commands.openapi_generator import ucc_object

class TestUccObject:
    
    def test_global_config(self):

        TEST_DIR = os.path.dirname(os.path.abspath(__file__))
        project_root_dir_path = Path(TEST_DIR).parent.parent
        
        ucc_generator_example_dir_path = project_root_dir_path / "example"
        gc = ucc_object.GlobalConfig(json_path= Path(ucc_generator_example_dir_path / "globalConfig.json"))
        
        ucc_generator_package_global_config_configuration = project_root_dir_path / "tests/testdata/test_addons/package_global_config_configuration"
        gc = ucc_object.GlobalConfig(json_path= Path(ucc_generator_package_global_config_configuration / "globalConfig.json"))
        
        ucc_generator_package_global_config_inputs_configuration_alerts = project_root_dir_path / "tests/testdata/test_addons/package_global_config_inputs_configuration_alerts"
        gc = ucc_object.GlobalConfig(json_path= Path(ucc_generator_package_global_config_inputs_configuration_alerts / "globalConfig.json"))
        
        assert 1 == 1

    def test_app_manifest(self):

        TEST_DIR = os.path.dirname(os.path.abspath(__file__))
        project_root_dir_path = Path(TEST_DIR).parent.parent
        
        ucc_generator_example_dir_path = project_root_dir_path / "example"
        am = ucc_object.AppManifest(json_path= Path(ucc_generator_example_dir_path / "package/app.manifest"))
        
        ucc_generator_package_global_config_configuration = project_root_dir_path / "tests/testdata/test_addons/package_global_config_configuration"
        am = ucc_object.AppManifest(json_path= Path(ucc_generator_package_global_config_configuration / "package/app.manifest"))
        
        ucc_generator_package_global_config_inputs_configuration_alerts = project_root_dir_path / "tests/testdata/test_addons/package_global_config_inputs_configuration_alerts"
        am = ucc_object.AppManifest(json_path= Path(ucc_generator_package_global_config_inputs_configuration_alerts / "package/app.manifest"))
        
        assert 1 == 1

    def test_ucc_project(self):

        TEST_DIR = os.path.dirname(os.path.abspath(__file__))
        project_root_dir_path = Path(TEST_DIR).parent.parent
        
        ucc_generator_example_dir_path = project_root_dir_path / "example"
        up = ucc_object.UccProject(project_path=ucc_generator_example_dir_path)
        
        ucc_generator_package_global_config_configuration = project_root_dir_path / "tests/testdata/test_addons/package_global_config_configuration"
        up = ucc_object.UccProject(project_path=ucc_generator_package_global_config_configuration)
        
        ucc_generator_package_global_config_inputs_configuration_alerts = project_root_dir_path / "tests/testdata/test_addons/package_global_config_inputs_configuration_alerts"
        up = ucc_object.UccProject(project_path=ucc_generator_package_global_config_inputs_configuration_alerts)
        
        assert 1 == 1