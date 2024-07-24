from typing import Any, Dict, List

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class InputsConf(ConfGenerator):
    __description__ = (
        "Generates `inputs.conf` and `inputs.conf.spec` "
        "file for the services mentioned in globalConfig"
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = "inputs.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.input_names: List[Dict[str, List[str]]] = []
        for service in self._global_config.inputs:
            properties = []
            if service.get("conf") is not None:
                # Add data input of self defined conf to inputs.conf.spec
                self.input_names.append(
                    {service["name"]: ["placeholder = placeholder"]}
                )
                continue
            for entity in service.get("entity", {"field": "name"}):
                # TODO: add the details and updates on what to skip and process
                if entity["field"] == "name":
                    continue
                nl = "\n"  # hack for `f-string expression part cannot include a backslash`
                # TODO: enhance the message formation for inputs.conf.spec file
                properties.append(
                    f"{entity['field']} = {entity.get('help', '').replace(nl, ' ')} "
                    f"{' Default: ' + str(entity['defaultValue']) if entity.get('defaultValue') is not None else ''}"
                )

            self.input_names.append({service["name"]: properties})

    def generate_conf(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["default", self.conf_file])
        stanzas: List[str] = []
        for k in self.input_names:
            stanzas.extend(k.keys())
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="inputs_conf.template"
        )

        rendered_content = self._template.render(input_names=stanzas)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_file: file_path}

    def generate_conf_spec(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="inputs_conf_spec.template"
        )

        rendered_content = self._template.render(
            input_stanzas=self.input_names,
        )
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
