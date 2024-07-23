from typing import Any, Tuple, List, Dict

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class SettingsConf(ConfGenerator):
    __description__ = (
        "Generates `<YOUR_ADDON_NAME>_settings.conf.spec` "
        "file for the Proxy, Logging or Custom Tab mentioned in globalConfig"
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = self._addon_name.lower() + "_settings.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.settings_stanzas: List[Tuple[str, List[str]]] = []
        for setting in self._global_config.settings:
            content = self._gc_schema._get_oauth_enitities(setting["entity"])
            fields = self._gc_schema._parse_fields(content)
            self.settings_stanzas.append(
                (setting["name"], [f"{f._name} = " for f in fields])
            )
        if self._gc_schema._endpoints.get("settings") is not None:
            self.default_content = self._gc_schema._endpoints[
                "settings"
            ].generate_conf_with_default_values()
        else:
            self.default_content = ""

    def generate_conf(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="settings_conf.template"
        )

        rendered_content = self._template.render(default_content=self.default_content)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}

    def generate_conf_spec(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="settings_conf_spec.template"
        )

        rendered_content = self._template.render(settings_stanzas=self.settings_stanzas)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
