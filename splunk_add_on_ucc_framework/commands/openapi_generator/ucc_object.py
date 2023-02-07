from pathlib import Path
from typing import List
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import DataClasses

class GlobalConfig(DataClasses):
    def _validate_actions_list(self, *, actions: List[str]) -> None:
        ALLOWED_VALUES = {"edit", "delete", "clone"}
        for action in actions:
            if action not in ALLOWED_VALUES:
                raise ValueError(f"Action {action} not in the list of allowed values ({ALLOWED_VALUES})")
    
    def _validate_configuration_tabs(self,*,tabs: List[DataClasses]=None) -> None:
        tab_names = set()
        for tab in tabs:
            if tab.name not in ['logging','proxy'] and hasattr(tab, "table") and hasattr(tab.table, "actions"):
                self._validate_actions_list(actions=tab.table.actions)
            if tab.name in tab_names:
                raise Exception(f'globalConfig.json contains duplicated Configuration tab {tab.name}')
            else:
                tab_names.add(tab.name)
    
    def _validate(self) -> None:
        self._validate_configuration_tabs(tabs=self.pages.configuration.tabs)
 
    def __init__(self, *, json_path: Path) -> None:
        super().__init__(json_path=json_path)
        self._validate()

class AppManifest(DataClasses):
    def __init__(self, *, json_path: Path) -> None:
        super().__init__(json_path=json_path)

class UccProject(object):
    def __init__(self, *, project_path: Path) -> None:
        self.global_config = GlobalConfig(json_path = Path(project_path / "globalConfig.json"))
        self.app_manifest = AppManifest(json_path = Path(project_path / "package/app.manifest"))