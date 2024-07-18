from typing import Any, Dict

from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class RestMapConf(ConfGenerator):
    __description__ = (
        "Generates restmap.conf for the custom REST handlers that "
        "are generated based on configs from globalConfig"
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = "restmap.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        scheme = GlobalConfigBuilderSchema(self._global_config)
        self.endpoints = scheme.endpoints
        self.endpoint_names = ", ".join(sorted([ep.name for ep in self.endpoints]))
        self.namespace = scheme.namespace

    def generate_conf(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="restmap_conf.template"
        )
        rendered_content = self._template.render(
            endpoints=self.endpoints,
            endpoint_names=self.endpoint_names,
            namespace=self.namespace,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
