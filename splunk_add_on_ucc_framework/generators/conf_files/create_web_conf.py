from typing import Any

from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import \
    GlobalConfigBuilderSchema
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class WebConf(ConfGenerator):
    __description__ = (
        "Generates web.conf to expose the endpoints generated in "
        "restmap.conf which is generated based on configs from globalConfig."
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def _set_attributes(self, **kwargs: Any) -> None:
        scheme = GlobalConfigBuilderSchema(self._global_config)
        self.endpoints = scheme.endpoints

    def generate_conf(self) -> None:
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="web_conf.template"
        )
        rendered_content = self._template.render(
            endpoints=self.endpoints,
        )
        self.writer(
            file_name="web.conf",
            file_path=self.get_file_output_path(["default", "web.conf"]),
            content=rendered_content,
        )

    def generate_conf_spec(self) -> None:
        return
