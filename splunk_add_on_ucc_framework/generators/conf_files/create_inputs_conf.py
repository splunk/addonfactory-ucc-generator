from typing import Any, Dict

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class InputsConf(ConfGenerator):
    __description__ = "Generates inputs.conf and inputs.conf.spec file for the services mentioned in globalConfig"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = "inputs.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.input_names = []
        for service in self._global_config.inputs:
            self.input_names.append(service.get("name"))

    def generate_conf(self) -> Dict[str, str]:
        file_path=self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="inputs_conf.template"
        )
        rendered_content = self._template.render(input_names=self.input_names)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

