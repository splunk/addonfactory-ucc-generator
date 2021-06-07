from os import path
import unittest

import splunk_add_on_ucc_framework as ucc


class UccGenerateTest(unittest.TestCase):
    def test_ucc_generate_without_arguments(self):
        package_folder = path.join(path.dirname(path.realpath(__file__)), "package")
        ucc.generate(source=package_folder)


if __name__ == "__main__":
    unittest.main()
