from ..file_generator import FileGenerator


class ConfGenerator(FileGenerator):
    __description__ = "DESCRIBE THE CONF FILE THAT IS GENERATED"

    def __init__(
        self, global_config, input_dir: str, output_dir: str, **kwargs
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def generate(self):
        self.generate_conf()
        self.generate_conf_spec()

    def _set_attributes(self, **kwargs):
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate_conf(self):
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        raise NotImplementedError()

    def generate_conf_spec(self):
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        raise NotImplementedError()
