from os.path import isfile, join
from typing import Any, Dict

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class ServerConf(ConfGenerator):
    __description__ = (
        "Generates `server.conf` for the custom conf "
        "files created as per configurations in globalConfig"
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = "server.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.custom_conf = []
        self.custom_conf.extend(list(self._gc_schema.settings_conf_file_names))
        self.custom_conf.extend(list(self._gc_schema.configs_conf_file_names))
        self.custom_conf.extend(list(self._gc_schema.oauth_conf_file_names))

    def generate_conf(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        # For now, only create server.conf only if
        # no server.conf is present in the source package.
        if isfile(join(self._input_dir, "default", self.conf_file)):
            return {"": ""}
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="server_conf.template"
        )
        rendered_content = self._template.render(custom_conf=self.custom_conf)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}
