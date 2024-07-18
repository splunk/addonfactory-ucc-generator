from time import time
from typing import Any

from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import \
    GlobalConfigBuilderSchema
from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class AppConf(ConfGenerator):
    __description__ = "Generates app.conf and app.conf.spec with the details mentioned in globalConfig[meta]"

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

        self.addon_version = kwargs["addon_version"]
        self.is_visible = kwargs["has_ui"]
        self.check_for_updates = True
        if self._global_config.meta.get("checkForUpdates") is False:
            self.check_for_updates = False
        if self._global_config.meta.get("supportedThemes") is not None:
            self.supported_themes = ", ".join(
                self._global_config.meta["supportedThemes"]
            )
        else:
            self.supported_themes = ""
        self.description = kwargs["app_manifest"].get_description()
        self.author = kwargs["app_manifest"].get_authors()[0]["name"]
        self.name = self._global_config.product
        self.build = str(int(time()))
        self.id = self._global_config.product
        self.label = self._global_config.display_name

    def generate_conf(self) -> None:
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="app_conf.template"
        )
        rendered_content = self._template.render(
            custom_conf=self.custom_conf,
            addon_version=self.addon_version,
            check_for_updates=self.check_for_updates,
            supported_themes=self.supported_themes,
            description=self.description,
            author=self.author,
            name=self.name,
            build=self.build,
            id=self.id,
            label=self.label,
            is_visible=self.is_visible,
        )
        self.writer(
            file_name="app.conf",
            file_path=self.get_file_output_path(["default", "app.conf"]),
            content=rendered_content,
        )

    def generate_conf_spec(self) -> None:
        return
