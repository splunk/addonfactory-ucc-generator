import xml.etree.ElementTree as ET
import xml.dom.minidom


class JUnitLogFileWriter(object):
    """Suite of test cases"""
    test_cases = []

    def __init__(self, name, file_path, test_cases=None, hostname=None, id=None, \
                 package=None, timestamp=None, properties=None):
        self.name = name
        if not test_cases:
            test_cases = []
        try:
            iter(test_cases)
        except TypeError:
            raise Exception('test_cases must be a list of test cases')
        self.test_cases = test_cases
        self.hostname = hostname
        self.id = id
        self.package = package
        self.timestamp = timestamp
        self.properties = properties
        self.file_path = file_path

    def write_test_result(self, test_name, fail_message):
        test_case = _JUnitTestCase(test_name)
        if len(fail_message) > 0:
            test_case.log_failure("test case: {0}, result:{1}\r\n".format(test_name, fail_message))
        self.__add_testcases(test_case)

    def close(self):
        f = open(self.file_path, 'w')
        self.to_file(f)
        f.close()

    def __build_xml_doc(self):
        """Builds the XML document for the JUnit test suite"""
        # build the test suite element
        test_suite_attributes = dict()
        test_suite_attributes['name'] = str(self.name)
        test_suite_attributes['failures'] = str(len([c for c in self.test_cases if c.is_failure()]))
        test_suite_attributes['time'] = str(sum(c.elapsed_sec for c in self.test_cases if c.elapsed_sec))
        test_suite_attributes['tests'] = str(len(self.test_cases))

        if self.hostname:
            test_suite_attributes['hostname'] = str(self.hostname)
        if self.id:
            test_suite_attributes['id'] = str(self.id)
        if self.package:
            test_suite_attributes['package'] = str(self.package)
        if self.timestamp:
            test_suite_attributes['timestamp'] = str(self.timestamp)

        xml_element = ET.Element("testsuite", test_suite_attributes)

        # add any properties
        if self.properties:
            props_element = ET.SubElement(xml_element, "properties")
            for k, v in self.properties.items():
                attrs = {'name': str(k), 'value': str(v)}
                ET.SubElement(props_element, "property", attrs)

        # test cases
        for case in self.test_cases:
            test_case_attributes = dict()
            test_case_attributes['name'] = str(case.name)
            if case.elapsed_sec:
                test_case_attributes['time'] = "%f" % case.elapsed_sec

            test_case_element = ET.SubElement(xml_element, "testcase", test_case_attributes)

            # failures
            if case.is_failure():
                attrs = {'type': 'failure'}
                if case.failure_message:
                    attrs['message'] = case.failure_message
                failure_element = ET.Element("failure", attrs)
                test_case_element.append(failure_element)

        return xml_element

    def __add_testcases(self, testcase):
        self.test_cases.append(testcase)

    def __to_xml_string(self, encoding=None):
        """Returns the string representation of the JUnit XML document"""
        if self.test_cases == None:
            raise Exception('test_suites must not be None')

        xml_element = ET.Element("testsuites")
        xml_element.append(self.__build_xml_doc())

        xml_string = ET.tostring(xml_element, encoding=encoding)
        xml_string = xml.dom.minidom.parseString(xml_string).toprettyxml()
        return xml_string

    def to_file(self, file_descriptor, encoding=None):
        """Writes the JUnit XML document to file"""
        xml_string = self.__to_xml_string(encoding)
        file_descriptor.write(xml_string)


class _JUnitTestCase(object):
    """A JUnit test case with a result and possibly some stdout or stderr"""

    def __init__(self, name, elapsed_sec=None):
        self.name = name
        self.elapsed_sec = elapsed_sec
        self.failure_message = None
        self.failure_output = None

    def log_failure(self, message=None, output=None):
        """Adds a failure message, output, or both to the test case"""
        if message:
            self.failure_message = message
        if output:
            self.failure_output = output

    def is_failure(self):
        """returns true if this test case is a failure"""
        return self.failure_output or self.failure_message




