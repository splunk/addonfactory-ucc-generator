from pathlib import Path
from typing import List
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import DataClasses

class GlobalConfig(DataClasses):
    def __init__(self, *, json_path: Path) -> None:
        super().__init__(json_path=json_path)

class AppManifest(DataClasses):
    def __init__(self, *, json_path: Path) -> None:
        super().__init__(json_path=json_path)

class UccProject(object):
    def __init__(self, *, project_path: Path) -> None:
        self.global_config = GlobalConfig(json_path = Path(project_path / "globalConfig.json"))
        self.app_manifest = AppManifest(json_path = Path(project_path / "package/app.manifest"))