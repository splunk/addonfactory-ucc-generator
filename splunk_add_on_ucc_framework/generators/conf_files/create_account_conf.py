from typing import Any, Tuple, List, Dict

from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class AccountConf(ConfGenerator):
    __description__ = (
        "Generates `<YOUR_ADDON_NAME>_account.conf.spec` "
        "file for the configuration mentioned in globalConfig"
    )

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = self._addon_name.lower() + "_account.conf"

    def _set_attributes(self, **kwargs: Any) -> None:
        self.account_fields: List[Tuple[str, List[str]]] = []
        for account in self._global_config.configs:
            # If the endpoint is oauth, which is for getting access_token, conf file entries
            # should not get created (compatibility to previous versions)
            if account["name"] == "oauth":
                continue
            content = self._gc_schema._get_oauth_enitities(account["entity"])
            fields = self._gc_schema._parse_fields(content)
            self.account_fields.append(("<name>", [f"{f._name} = " for f in fields]))

    def generate_conf_spec(self) -> Dict[str, str]:
        file_path = self.get_file_output_path(["README", self.conf_spec_file])
        self.set_template_and_render(
            template_file_path=["README"], file_name="account_conf_spec.template"
        )

        rendered_content = self._template.render(account_stanzas=self.account_fields)
        self.writer(
            file_name=self.conf_file,
            file_path=file_path,
            content=rendered_content,
        )
        return {self.conf_spec_file: file_path}
