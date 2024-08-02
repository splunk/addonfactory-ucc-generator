from ..file_generator import FileGenerator
from typing import Dict, Any, Union, NoReturn
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class HTMLGenerator(FileGenerator):
    __description__ = "DESCRIBE THE HTML FILE THAT IS GENERATED"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Dict[str, Any]
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def generate(self) -> Dict[str, str]:
        html_files: Dict[str, str] = {}
        html_files.update(self.generate_html())
        return html_files

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate_html(self) -> Dict[str, str]:
        # uses the attributes set in  _set_attributes method to set the required attributes
        # uses set_template_and_render to load and render the HTML template.
        # use self.writer function to create the html file.
        return {"": ""}
