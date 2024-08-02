from splunk_add_on_ucc_framework.generators.html_files import HTMLGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    arf_consts as ac,
    normalize,
)
from typing import Dict, Any
from os import linesep
from re import search


class AlertHtml(HTMLGenerator):
    __description__ = (
        " Generates `alert_name.html` file based on alerts configuration present in globalConfig"
        " in `default/data/ui/alerts` folder."
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Dict[str, Any],
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def _set_attributes(self, **kwargs: Dict[str, Any]) -> None:
        if self._global_config and self._global_config.has_alerts():
            self._html_home = "alert_html_skeleton.template"
            envs = normalize.normalize(
                self._global_config.alerts,
                self._global_config.namespace,
            )
            schema_content = envs["schema.content"]
            self._alert_settings = schema_content["modular_alerts"]
            for self.alert in self._alert_settings:
                self.generate_html()

    def generate_html(self) -> Dict[str, str]:
        if self._global_config and not self._global_config.has_alerts():
            return super().generate_html()
        self.set_template_and_render(
            template_file_path=["html_templates"], file_name="mod_alert.html.template"
        )
        rendered_content = self._template.render(
            mod_alert=self.alert, home_page=self._html_home
        )
        text = linesep.join(
            [s for s in rendered_content.splitlines() if not search(r"^\s*$", s)]
        )
        file_name = f"{self.alert[ac.SHORT_NAME] + '.html'}"
        file_path = self.get_file_output_path(
            [
                "default",
                "data",
                "ui",
                "alerts",
                file_name,
            ]
        )
        self.writer(
            file_name=file_name,
            file_path=file_path,
            content=text,
        )
        return {file_name: file_path}
