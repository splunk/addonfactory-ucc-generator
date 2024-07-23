from typing import Any, Dict

from splunk_add_on_ucc_framework.commands.modular_alert_builder import arf_consts as ac
from splunk_add_on_ucc_framework.commands.modular_alert_builder import normalize
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class TagsConf(ConfGenerator):
    __description__ = (
        "Generates `tags.conf` file based on the "
        "`eventtypes.conf` created for custom alert actions."
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = "tags.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        envs = normalize.normalize(
            self._global_config.alerts,
            self._global_config.namespace,
        )
        schema_content = envs["schema.content"]
        self.alert_settings = schema_content[ac.MODULAR_ALERTS]

    def generate_conf(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="tags_conf.template"
        )
        rendered_content = self._template.render(mod_alerts=self.alert_settings)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
