import tempfile
import unittest
from os import path

import splunk_add_on_ucc_framework as ucc


class UccGenerateTest(unittest.TestCase):
    def test_ucc_generate(self):
        package_folder = path.join(path.dirname(path.realpath(__file__)), "package")
        ucc.generate(source=package_folder)

    def test_ucc_generate_with_custom_output_folder(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            package_folder = path.join(path.dirname(path.realpath(__file__)), "package")
            ucc.generate(source=package_folder, outputdir=temp_dir)


if __name__ == "__main__":
    unittest.main()
