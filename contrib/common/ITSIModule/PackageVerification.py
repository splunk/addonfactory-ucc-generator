"""
Package verification will unzip the itsi module package and verify the folder and file structure. The module's folder
and file structure need to be defined in package_verification_test.xml
"""

import os
from xml.dom import minidom
from ITSIModule.lib.JUnitLogFileWriter import JUnitLogFileWriter


class PackageVerification(object):
    """
    Package_verification_test_xml contains all the files and folder structure followed by all the modules
    """

    def __init__(self, package_verification_test_xml):
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.package_verification_test_xml = minidom.parse(package_verification_test_xml)
        self.modules = self.package_verification_test_xml.getElementsByTagName("module")
        self.log_path = os.path.join(os.getcwdu(), 'package_verification_result.xml')

    def run_test(self):

        # Initial test result write object.
        junit_writer = JUnitLogFileWriter("ITSI Module Package Verification Tests", self.log_path)

        # Iterate through all the modules defined in the package verification test xml file.
        for module in self.modules:
            module_name = module.getAttribute("name")
            path_to_module_folder = os.path.join(self.splunk_home, 'etc/apps/', module_name)
            self.check_file_structure_recursive(module, path_to_module_folder, junit_writer, module_name)
            self.check_test_folder_does_not_exist(junit_writer, module_name)

        # Write the test result into the log file.
        junit_writer.close()

    def check_file_structure_recursive(self, current_element, current_element_path, junit_writer, module_name):

        # Test if the path for the current element exists.
        current_element_name = current_element.getAttribute("name")
        current_test_result = \
            self.check_file_structure(current_element_name, current_element_path, junit_writer, module_name)

        # If the path for the current element exists, test the paths of all child nodes.
        if current_test_result:
            for child_element in current_element.childNodes:
                if child_element.nodeType == minidom.Node.ELEMENT_NODE:
                    child_element_name = child_element.getAttribute("name")
                    child_element_path = os.path.join(current_element_path, child_element_name)
                    self.check_file_structure_recursive(
                        child_element, child_element_path, junit_writer, module_name)

    @staticmethod
    def check_file_structure(element_name, file_path, junit_writer, module_name):

        # Prepare test case description
        test_case = "{0}: Test for {1} at {2}".format(module_name, element_name, file_path)

        if not os.path.exists(file_path):
            junit_writer.write_test_result(test_case, "failed")
            return False
        else:
            junit_writer.write_test_result(test_case, "")
            return True

    def check_test_folder_does_not_exist(self, junit_writer, module_name):
        test_case = "{0}: Test folder should not be shipped with the package.".format(module_name)
        test_folder_path = os.path.join(self.splunk_home, 'etc/apps/', module_name, 'test')

        if not os.path.exists(test_folder_path):
            junit_writer.write_test_result(test_case, "")
            return True
        else:
            junit_writer.write_test_result(test_case, "failed")
            return False


def main():
    xml_file = os.path.join(os.getcwd(), 'package_verification_test.xml')
    package_verification_test = PackageVerification(xml_file)
    package_verification_test.run_test()


if __name__ == "__main__":
    main()
