from os.path import isfile, join
from typing import Any

from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import \
    GlobalConfigBuilderSchema
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class ServerConf(ConfGenerator):
    __description__ = "Generates server.conf for the custom conf files created as per definition in globalConfig"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def _set_attributes(self, **kwargs: Any) -> None:
        self.custom_conf = []
        scheme = GlobalConfigBuilderSchema(self._global_config)
        self.custom_conf.extend(list(scheme.settings_conf_file_names))
        self.custom_conf.extend(list(scheme.configs_conf_file_names))
        self.custom_conf.extend(list(scheme.oauth_conf_file_names))

    def generate_conf(self) -> None:
        # For now, only create server.conf only if
        # no server.conf is present in the source package.
        if isfile(join(self._input_dir, "default", "server.conf")):
            return
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="server_conf.template"
        )
        rendered_content = self._template.render(custom_conf=self.custom_conf)
        self.writer(
            file_name="server.conf",
            file_path=self.get_file_output_path(["default", "server.conf"]),
            content=rendered_content,
        )

    def generate_conf_spec(self) -> None:
        return
