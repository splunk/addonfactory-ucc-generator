from abc import abstractmethod
from typing import Any

from splunk_add_on_ucc_framework.global_config import GlobalConfig

from ..file_generator import FileGenerator


class ConfGenerator(FileGenerator):
    __description__ = "DESCRIBE THE CONF FILE THAT IS GENERATED"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def generate(self) -> None:
        self.generate_conf()
        self.generate_conf_spec()

    @abstractmethod
    def _set_attributes(self, **kwargs: Any) -> None:
        # parse self._global_config and set the require attributes for self
        return

    @abstractmethod
    def generate_conf(self) -> None:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return

    @abstractmethod
    def generate_conf_spec(self) -> None:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return
