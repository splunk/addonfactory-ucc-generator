import os
import logging
import re
import collections

from matinal import Matinal
import title_style_check


def _escape_str(s):
    if isinstance(s, basestring):
        return s.replace('"', '\\"')
    else:
        return s


def _create_result(rid, params=None):
    if params:
        escaped_params = {k: _escape_str(v) for k, v in params.iteritems()}
        return {'result_id': str(rid), 'result_param': escaped_params}
    else:
        return {'result_id': str(rid)}


class TestMatinal(object):
    def setup_class(self, ta_folder=None):
        self.logger = logging.getLogger('Test_Matinal')

        self.skip_test_cases = os.environ.get('MATINAL_SKIP_CASES', '')
        ta_source_path = os.path.join(os.environ.get('TA_SOURCE_FOLDER', ''))

        self.logger.info('TA_SOURCE_FOLDER = ' + ta_source_path)
        self.utils2 = Matinal(ta_source_path)

        self.appname = None
        if self.utils2.file_exist('build.properties'):
            self.appname = self.utils2.get_all_values(
                'build.properties', '(appname|package\.name'
                '|package\.output\.filename)\s*=\s*(\S*)', 2)[0]
        elif self.utils2.file_exist('build.json'):
            self.appname = self.utils2.get_all_values(
                'build.json', r'"name"\s*:\s*"(\S*)"', 1)[0]
        else:
            self.logger.info("Could not detect TA name.")

        if ta_folder is None:
            self.ta_folder = self.appname
        else:
            self.ta_folder = ta_folder
            self.appname = ta_folder

        assert self.ta_folder is not None

        self.splunk_home = os.environ.get('SPLUNK_HOME', '')
        self.ta_path = os.path.join(self.splunk_home, 'etc/apps',
                                    self.ta_folder)
        self.utils = Matinal(self.ta_path)
        self.logger.info('TA_FOLDER = ' + self.ta_path)

    def run_test_case(self, func_name):
        func = getattr(self, func_name)
        results = []
        try:
            func(results)
        except AssertionError:
            pass
        return results

    def get_ta_builder_cases(self):
        ml = dir(self)
        ta_builder_func_list = []
        for func_name in ml:
            func = getattr(self, func_name)
            if func.__doc__ and func.__doc__.find('TABUILDER') >= 0:
                ta_builder_func_list.append(func_name)
        return ta_builder_func_list

    def test_addon_folder(self, results=None):
        if results is None:
            results = []

        ta_name_pattern = re.compile(r'(Splunk_TA_|splunk_app_)[^_]+$')
        if ta_name_pattern.match(
                self.ta_folder) is None or not self.utils.dir_exist(''):
            r1 = _create_result(8000, {'ta_folder': self.ta_folder, })
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8001)

        results.append(r1)

    def test_addon_no_local_folder(self, results=None):
        if results is None:
            results = []

        # use utils2 as eventgen may create local folder at run-time
        folder_exist = self.utils2.dir_exist('package/local')
        if folder_exist:
            r1 = _create_result(8002)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8003)

        results.append(r1)

    def test_addon_no_local_in_metadata_folder(self, results=None):
        if results is None:
            results = []

        file_exist = self.utils2.file_exist('package/metadata/local.meta')
        if file_exist:
            r1 = _create_result(8004)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8005)
        results.append(r1)

    def test_app_docs_section_override(self, results=None):
        if results is None:
            results = []

        result = self.utils.check_line_in_stanza(
            'default/app.conf', 'ui',
            'docs_section_override\\s*=\\s*AddOns:released')
        if result is False:
            r1 = _create_result(8006)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8007)
        results.append(r1)

    def test_app_package_id(self, results=None):
        if results is None:
            results = []

        result = self.utils.check_line_in_stanza(
            'default/app.conf', 'package', 'id\s*=\s*' + self.appname + '$')

        if result is False:
            r1 = _create_result(8008, {'app_name': self.appname})
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8009)
        results.append(r1)

    def test_build_appname(self, results=None):
        if results is None:
            results = []

        r = re.compile(r"(Splunk_TA_|splunk_app_)[^_]+$")
        if r.match(self.appname) is None:
            r1 = _create_result(8010, {"app_name": self.appname})
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8011)

        results.append(r1)

    def test_commands_no_default_stanza(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/commands.conf'):
            stanza_list = self.utils.get_all_stanza('default/commands.conf')
            # no duplicated stanza
            if len(stanza_list) != len(set(stanza_list)):
                r1 = _create_result(
                    8012, {'stanza_name':
                           str([item
                                for item, count in collections.Counter(
                                    stanza_list).items() if count > 1][0])})
                self.logger.info(r1)
                results.append(r1)

            for stanza in stanza_list:
                if stanza.lower() == 'default':
                    r1 = _create_result(8013)
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8014)

        results.append(r1)

    def test_file_in_top_directory(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        check_file_list = ['README.txt', 'license-eula.rtf',
                           'license-eula.txt']
        top_files = self.utils.get_files('.', '.*')
        for file_name in check_file_list:
            if file_name in top_files:
                top_files.remove(file_name)

        if len(top_files) != 0:
            r1 = _create_result(8015, {'unneeded_files': str(top_files)})
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8016)

        results.append(r1)

    def test_eventgen_no_duplicated_header(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/eventgen.conf'):
            eventgen_expr = self.utils.get_all_stanza('default/eventgen.conf')
            duplicated_header = []
            for expr in eventgen_expr:
                if eventgen_expr.count(expr) > 1:
                    duplicated_header.append(expr)

            if len(duplicated_header) > 0:
                duplicated_header = list(set(duplicated_header))
                header_str = '[' + duplicated_header[0] + ']'
                if len(duplicated_header) > 1:
                    header_str += ' and others '
                r1 = _create_result(8017, {'header': header_str})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8018)

        results.append(r1)

    def test_eventtypes_no_duplicated_header(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/eventtypes.conf'):
            eventgen_expr = self.utils.get_all_stanza(
                'default/eventtypes.conf')
            duplicated_header = []
            for expr in eventgen_expr:
                if eventgen_expr.count(expr) > 1:
                    duplicated_header.append(expr)

            if len(duplicated_header) > 0:
                duplicated_header = list(set(duplicated_header))
                header_str = '[' + duplicated_header[0] + ']'
                if len(duplicated_header) > 1:
                    header_str += ' and others '
                r1 = _create_result(8019, {'header': header_str})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8020)

        results.append(r1)

    def test_eventtypes_no_colon(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        stanza_list = self.utils.get_all_stanza('default/eventtypes.conf')

        malformed_eventtypes = []
        for stanza in stanza_list:
            if stanza.find(':') != -1:
                malformed_eventtypes.append(stanza)

        if len(malformed_eventtypes) > 0:
            if len(malformed_eventtypes) > 2:
                eventtypes_str = "\"" + "\",\"".join(malformed_eventtypes[:2]) + "\" and others"
            else:
                eventtypes_str = "\"" + "\",\"".join(malformed_eventtypes) + "\""
            if len(malformed_eventtypes) == 1:
                r1 = _create_result(8021, {'stanza': eventtypes_str})
            else:
                r1 = _create_result(8096, {'stanzas': eventtypes_str})
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0 or self.skip_test_cases.find(
            'test_eventtypes_no_colonS') >= 0
        r1 = _create_result(8022)

        results.append(r1)

    def test_inputs_no_default_stanza(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        stanza_list = self.utils.get_all_stanza('default/inputs.conf')
        # no duplicated stanza
        if len(stanza_list) != len(set(stanza_list)):
            r1 = _create_result(8023,
                                {'stanza':
                                 str([item
                                      for item, count in collections.Counter(
                                          stanza_list).items() if count > 1][0])})
            self.logger.info(r1)
            results.append(r1)

        for stanza in stanza_list:
            if stanza.lower() == 'default':
                r1 = _create_result(8024)
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8025)

        results.append(r1)

    def test_lookup_file_all_used(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        # all lookup files exists in transforms.conf
        if self.utils.dir_exist('lookups'):
            lookup_files = self.utils.get_files('lookups', '.*')
            if len(lookup_files) == 0:
                r1 = _create_result(8026)
                self.logger.info(r1)
                results.append(r1)
            else:
                transforms_file_exist = self.utils.file_exist(
                    'default/transforms.conf')
                if transforms_file_exist is False:
                    r1 = _create_result(8027)
                    self.logger.info(r1)
                    results.append(r1)
                else:
                    for file_name in lookup_files:
                        values = self.utils.get_all_values(
                            'default/transforms.conf',
                            'filename\s*=.*(' + file_name + ')')
                        file_lines = self.utils.get_all_values(
                            'lookups/' + file_name, '(\S*)')

                        if len(file_lines) == 0:
                            r1 = _create_result(8028, {'fname': file_name})
                            self.logger.info(r1)
                            results.append(r1)

                        if len(values) == 0:
                            r1 = _create_result(8029, {'fname': file_name})
                            self.logger.info(r1)
                            results.append(r1)

        # all files mentioned in transforms.conf should exist in lookups folder
        if self.utils.file_exist('default/transforms.conf'):
            file_name_list = self.utils.get_all_values(
                'default/transforms.conf', 'filename\s*=\s*(\S*)')
            for file_name in file_name_list:
                if not self.utils.file_exist('lookups/' + os.path.basename(
                        file_name)):
                    r1 = _create_result(8030, {'fname':
                                               os.path.basename(file_name)})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0 or self.skip_test_cases.find(
            'test_lookup_file_all_usedS') >= 0
        r1 = _create_result(8031)
        results.append(r1)

    def test_panel_title_check(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.dir_exist('default/data/ui/panels'):
            xml_list = self.utils.get_files('default/data/ui/panels',
                                            '.*\.xml$')

            if len(xml_list) > 0:
                title_style_check.glb_whitelist = title_style_check.generate_whitelist(
                    self.utils.get_file_full_path('default/data/ui/panels'))

            for file1 in xml_list:
                warnings = title_style_check.process_file(
                    self.utils.get_file_full_path('default/data/ui/panels/' +
                                                  file1),
                    fix=False,
                    clean=False,
                    title_length=80)
                for a_warning in warnings:
                    r1 = _create_result(8032, {'fname': file1,
                                               'warning_msg': a_warning})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8033)
        results.append(r1)

    def test_props_no_duplicated_header(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/props.conf'):
            eventgen_expr = self.utils.get_all_stanza('default/props.conf')
            duplicated_header = []
            for expr in eventgen_expr:
                if eventgen_expr.count(expr) > 1:
                    duplicated_header.append(expr)

            if len(duplicated_header) > 0:
                duplicated_header = list(set(duplicated_header))
                header_str = '[' + duplicated_header[0] + ']'
                if len(duplicated_header) > 1:
                    header_str += ' and others '
                r1 = _create_result(8034, {'header': header_str})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0

        r1 = _create_result(8035)
        results.append(r1)

    def test_props_regex_stanza_two_colons(self, results=None):
        if results is None:
            results = []

        stanza_list = self.utils.get_all_stanza('default/props.conf')

        for stanza in stanza_list:
            if (stanza.find('*') >= 0 or
                    stanza.find('?') >= 0) and stanza.find('::') < 0:
                r1 = _create_result(8036, {'stanza': stanza})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0

        r1 = _create_result(8037)
        results.append(r1)

    def test_props_no_regex_stanza(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        stanza_list = self.utils.get_all_stanza('default/props.conf')

        for stanza in stanza_list:
            if (stanza.find('*') >= 0 or
                    stanza.find('?') >= 0) and not stanza.startswith('source'):
                r1 = _create_result(8038, {'stanza': stanza})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0 or self.skip_test_cases.find(
            'test_props_no_regex_stanzaS') >= 0

        r1 = _create_result(8039)
        results.append(r1)

    def test_props_report_unique_name(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        stanza_list = self.utils.get_all_stanza('default/props.conf')

        for stanza in stanza_list:
            value_list = self.utils.get_all_values_in_stanza(
                'default/props.conf', stanza, 'REPORT-([^=\s]*)')
            for item, count in collections.Counter(value_list).items():
                if count > 1:
                    r1 = _create_result(8040, {'item': item, 'stanza': stanza})
                    self.logger.info(r1)
                    results.append(r1)

            value_list = self.utils.get_all_values_in_stanza(
                'default/props.conf', stanza, 'REPORT-.*=\s*(\S*)')
            for item, count in collections.Counter(value_list).items():
                if count > 1:
                    r1 = _create_result(8040, {'item': item, 'stanza': stanza})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0

        r1 = _create_result(8041)
        results.append(r1)

    def test_readme_copyright_variable(self, results=None):
        if results is None:
            results = []

        has_copyright = self.utils2.get_all_values(
            'package/README.txt', r'(\${copyright}|@copyright@)')
        if len(has_copyright) != 1:
            r1 = _create_result(8042)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8043)
        results.append(r1)

    def test_readme_md_neg(self, results=None):
        if results is None:
            results = []

        file_exist = self.utils.file_exist('README.md')
        if file_exist:
            r1 = _create_result(8044)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8055)
        results.append(r1)

    def test_readme_txt(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        file_exist = self.utils.file_exist('README.txt')

        if not file_exist:
            r1 = _create_result(8046)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8047)
        results.append(r1)

    def test_readme_version_variable(self, results=None):
        if results is None:
            results = []

        has_version = self.utils2.get_all_values(
            'package/README.txt',
            r'(@version\.major@\.@version\.minor@\.@version\.revision@'
            r'|\${version\.major}\.\${version\.minor}\.\${version\.revision})')
        if len(has_version) == 0:
            r1 = _create_result(8048)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8049)
        results.append(r1)

    def test_sample_file_all_used(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.dir_exist('samples'):
            sample_files = self.utils.get_files('samples', '.*')
            eventgen_expr = self.utils.get_all_stanza('default/eventgen.conf')
            header_set = set()

            for file_name in sample_files:
                b = False
                for expr in eventgen_expr:
                    r = re.compile(expr)
                    if r.match(file_name) \
                            or self.utils.check_line_in_stanza('default/eventgen.conf', expr, file_name):
                        header_set.add(expr)
                        b = True
                if b is False:
                    r1 = _create_result(8050, {'fname': file_name})
                    self.logger.info(r1)
                    results.append(r1)

            for expr in header_set:
                while eventgen_expr.count(expr) > 0:
                    eventgen_expr.remove(expr)

            for expr in eventgen_expr:
                if expr != 'global':
                    r1 = _create_result(8051, {'stanza': expr})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0 or self.skip_test_cases.find(
            'test_sample_file_all_usedS') >= 0
        r1 = _create_result(8052)
        results.append(r1)

    def test_sourcetype_no_underscore(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        sourcetype_list = []
        # Read sourcetype from props.conf stanza header
        for header in self.utils.get_all_stanza('default/props.conf'):
            if header.find('::') < 0:
                sourcetype_list.append(header)

        # Get all conf files and find sourcetype definition
        conf_file_list = self.utils.get_files('default', '.*\.conf$')
        for file_name in conf_file_list:
            sourcetype_list.extend(self.utils.get_all_values(
                'default/' + file_name, r'\bsourcetype\s*=\s*"?(\S*)"?'))

        sourcetype_list = list(set(sourcetype_list))
        sourcetype_list = [s for s in sourcetype_list if s.find('_') >= 0]

        if len(sourcetype_list) == 1:
            r1 = _create_result(8053, {'stype': sourcetype_list[0]})
        elif len(sourcetype_list) == 2:
            r1 = _create_result(8097, {'stype': sourcetype_list[0] + ' and ' + sourcetype_list[1]})
        elif len(sourcetype_list) > 2:
            r1 = _create_result(8097, {'stype': sourcetype_list[0] + ', ' + sourcetype_list[1] + ' and other'})

        if len(sourcetype_list) > 0:
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8054)
        results.append(r1)

    def test_tags_no_duplicated_header(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/tags.conf'):
            eventgen_expr = self.utils.get_all_stanza('default/tags.conf')
            duplicated_header = []
            for expr in eventgen_expr:
                if eventgen_expr.count(expr) > 1:
                    duplicated_header.append(expr)

            for header in set(duplicated_header):
                r1 = _create_result(8055, {'stanza': header})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8056)
        results.append(r1)

    def test_regex_capture_group(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        stanzas = self.utils.get_all_stanza('default/transforms.conf')
        has_capture_group_issue = False
        for stanza in stanzas:
            regex1 = self.utils.get_all_values_in_stanza(
                'default/transforms.conf', stanza, r'REGEX\s*=\s*(.*)')

            format1 = self.utils.get_all_values_in_stanza(
                'default/transforms.conf', stanza, r'FORMAT\s*=\s*(.*)')

            if len(regex1) > 0 and len(format1) > 0:
                regex1 = regex1[0]
                format1 = format1[0]
                regex2 = regex1.replace('(?<', '(?P<')

                try:
                    re1 = re.compile(regex2)
                except re.error:
                    r1 = _create_result(8057, {'regex': regex1})
                    self.logger.info(r1)
                    results.append(r1)

                if re1:
                    for i in range(re1.groups):
                        if format1.find('$' + str(i + 1)) < 0:
                            has_capture_group_issue = True
                            r1 = _create_result(8058,
                                                {'group': '$' + str(i + 1),
                                                 'stanza': stanza})
                            self.logger.info(r1)
                            results.append(r1)

        if has_capture_group_issue:
            r1 = _create_result(8059)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8060)
        results.append(r1)

    def test_transforms_stanza_in_props(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        transforms_stanza_name_list = self.utils.get_all_stanza(
            'default/transforms.conf')
        props_stanza_value_list = self.utils.get_all_values(
            'default/props.conf', r'\bLOOKUP-[^=]*=\s*(\S*)')
        tl = self.utils.get_all_values('default/props.conf',
                                       r'\b(TRANSFORMS|REPORT)-[^=]*=(.*)$', 2)
        pattern = re.compile(r',|\s')
        for item in tl:
            for name in pattern.split(item):
                if len(name.strip()) > 0:
                    props_stanza_value_list.append(name.strip())

        self.logger.info(str(set(transforms_stanza_name_list)))
        self.logger.info(str(set(props_stanza_value_list)))

        for item in (set(transforms_stanza_name_list) -
                     set(props_stanza_value_list)):
            # Modular regex
            if not self.utils.get_all_values('default/transforms.conf',
                                             r'(\[\[' + item + r'\]\])'):
                r1 = _create_result(8061, {'key': item})
                self.logger.info(r1)
                results.append(r1)

        for item in (set(props_stanza_value_list) -
                     set(transforms_stanza_name_list)):
            r1 = _create_result(8062, {'key': item})
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0 or self.skip_test_cases.find(
            'test_transforms_stanza_in_propsS') >= 0
        r1 = _create_result(8063)
        results.append(r1)

    def test_tags_stanza_name(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        tags_stanza_name = self.utils.get_all_stanza('default/tags.conf')
        pattern = re.compile('\w+=.+')
        for stanza in tags_stanza_name:
            if not pattern.match(stanza):
                r1 = _create_result(8064, {'stanza': stanza})
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8065)
        results.append(r1)

    def test_no_global_default_definition_in_conf(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        all_conf = self.utils.get_files('default', '.*\.conf')
        for f in all_conf:
            if self.utils.has_global_definition('default/' + f):
                r1 = _create_result(8066, {'fname': f})
                self.logger.info(r1)
                results.append(r1)
            stanza_list = self.utils.get_all_stanza('default/' + f)

            for stanza in stanza_list:
                if stanza.lower() == 'default':
                    r1 = _create_result(8067, {'fname': f})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8068)
        results.append(r1)

    def test_no_duplicate_key_in_stanza(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        files_to_check = ['default/props.conf', 'default/transforms.conf']
        for file1 in files_to_check:
            if self.utils.file_exist(file1):
                stanza_list = self.utils.get_all_stanza(file1)
                for stanza in set(stanza_list):
                    key_list = self.utils.get_all_values_in_stanza(
                        file1, stanza, r'^\s*([^=\s]*)\s*=')
                    reported_key = []
                    for k in set(key_list):
                        if key_list.count(k) > 1 and k not in reported_key:
                            reported_key.append(k)
                            r1 = _create_result(8069, {'key': k,
                                                       'stanza': stanza,
                                                       'file': file1[file1.find('/')+1:]})
                            self.logger.info(r1)
                            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8070)
        results.append(r1)

    def test_app_tokens(self, results=None):
        if results is None:
            results = []

        result = self.utils2.check_line_in_stanza(
            'package/default/app.conf', 'launcher',
            r'^\s*description\s*=\s*\$\{friendly\.name\}\s*$')

        if not result:
            r1 = _create_result(8071)
            self.logger.info(r1)
            results.append(r1)

        result = self.utils2.check_line_in_stanza(
            'package/default/app.conf', 'launcher',
            r'^\s*version\s*=\s*\$\{version\.major\}'
            r'\.\$\{version\.minor\}'
            r'\.\$\{version\.revision\}\s*$')
        if not result:
            r1 = _create_result(8072)
            self.logger.info(r1)
            results.append(r1)

        result = self.utils2.check_line_in_stanza(
            'package/default/app.conf', 'install',
            r'^\s*build\s*=\s*\$\{version\.build\}\s*$')
        if not result:
            r1 = _create_result(8073)
            self.logger.info(r1)
            results.append(r1)

        result = self.utils2.check_line_in_stanza(
            'package/default/app.conf', 'package',
            r'^\s*id\s*=\s*\$\{package\.name\}\s*$')
        if not result:
            r1 = _create_result(8074)
            self.logger.info(r1)
            results.append(r1)

        result = self.utils2.get_all_values('package/default/app.conf',
                                            r'(#\s*\$\{package\.name\})')
        if len(result) == 0:
            r1 = _create_result(8075)
            self.logger.info(r1)
            results.append(r1)

        result = self.utils2.get_all_values('package/default/app.conf',
                                            r'(#\s*\$\{copyright\})')
        if len(result) == 0:
            r1 = _create_result(8076)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8077)
        results.append(r1)

    def test_default_meta_exist(self, results=None):
        if results is None:
            results = []

        if not self.utils2.file_exist('package/metadata/default.meta'):
            r1 = _create_result(8078)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8079)
        results.append(r1)

    def test_inputs_start_by_shell_false(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        white_list = ['blacklist:', 'monitor:', 'tcp:', 'udp:', 'fifo:',
                      'fschange:', 'filter:', 'http', 'http:', 'perfmon:',
                      'MonitorNoHandle:', 'WinEventLog:', 'admon:',
                      'WinRegMon:', 'WinHostMon:', 'WinPrintMon:',
                      'WinNetMon:', 'powershell:', 'powershell2:']

        stanza_headers = self.utils.get_all_stanza('default/inputs.conf')
        for header in stanza_headers:
            in_white_list = False
            for w in white_list:
                if header.startswith(w):
                    in_white_list = True

            if not in_white_list:
                l = self.utils.get_all_values_in_stanza(
                    'default/inputs.conf', header,
                    r'(start_by_shell\s*=\s*false)')
                mi_type = header[:header.find(':')]
                ll = []
                if mi_type in stanza_headers:
                    ll = self.utils.get_all_values_in_stanza(
                        'default/inputs.conf', mi_type,
                        r'(start_by_shell\s*=\s*false)')
                if len(l) == 0 and len(ll) == 0:
                    r1 = _create_result(8080, {'stanza': header})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8081)
        results.append(r1)

    def test_inputs_conf_spec_exist(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        inputs_file_exist = self.utils.file_exist('default/inputs.conf')
        spec_file_exist = self.utils.file_exist('README/inputs.conf.spec')

        if inputs_file_exist and not spec_file_exist:
            white_list = ['blacklist:', 'monitor:', 'tcp:', 'udp:', 'fifo:',
                          'fschange:', 'filter:', 'http', 'http:', 'perfmon:',
                          'MonitorNoHandle:', 'WinEventLog:', 'admon:',
                          'WinRegMon:', 'WinHostMon:', 'WinPrintMon:',
                          'WinNetMon:', 'powershell:', 'powershell2:', 'script:']

            stanza_headers = self.utils.get_all_stanza('default/inputs.conf')
            has_modinput = False
            for header in stanza_headers:
                in_white_list = False
                for prefix in white_list:
                    if header.find(prefix) == 0:
                        in_white_list = True
                if not in_white_list:
                    has_modinput = True

            if has_modinput:
                r1 = _create_result(8082)
                self.logger.info(r1)
                results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8083)
        results.append(r1)

    def test_readme_version(self, results=None):
        if results is None:
            results = []

        has_copyright = self.utils2.get_all_values(
            'package/README.txt', r'(\$\{friendly\.name\}\s*'
            r'version\s*\$\{version\.major\}\.'
            r'\$\{version\.minor\}\.'
            r'\$\{version\.revision\})')
        if len(has_copyright) != 1:
            r1 = _create_result(8084)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8085)
        results.append(r1)

    def test_readme_document_link(self, results=None):
        if results is None:
            results = []

        has_copyright = self.utils2.get_all_values('package/README.txt', r'(http://docs.splunk.com/'
                                                                         r'Documentation/)(AddOns/latest/'
                                                                         r'\$\{ponydocs\.shortname\}'
                                                                         r'|\${ponydocs\.shortname}/latest)')
        if len(has_copyright) != 1:
            r1 = _create_result(8086)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8087)
        results.append(r1)

    def test_tags_value(self, results=None):
        """TABUILDER"""
        if results is None:
            results = []

        if self.utils.file_exist('default/tags.conf'):
            eventgen_expr = self.utils.get_all_values(
                'default/tags.conf',
                r'^[^#]\s*[^\s\[\]]+\s*=\s*([^\s\[\]]+)\s*$')

            for expr in eventgen_expr:
                if expr != 'enabled' and expr != 'disabled':
                    r1 = _create_result(8088, {'value': expr})
                    self.logger.info(r1)
                    results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8089)
        results.append(r1)

    def test_eventgen_sample_anonymized(self, results=None):
        if results is None:
            results = []

        rules = {
            'user ID':
            r'([A-Za-z0-9.]+\\[A-Za-z0-9.]+)|((?:[Uu]ser|[Uu][Ii][Dd]|[Uu][Ss][Ee][Rr]\.?_?-?[Ii][Dd])[= ]+[A-Za-z0-9.]+)|([A-Za-z0-9.]+)@',
            'credit card numbers':
            r'(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|(6(?:011|5[0-9]{2})[0-9]{12})|((?:2131|1800|35\\d{3})\\d{11})',
            'social security number': r'\d{3}[^\w]\d{2}[^\w]\d{4}',
            'email':
            r'\b([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-\._]*[A-Za-z0-9])@(([A-Za-z0-9]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])\b',
            'url': r'[A-Za-z]+://[A-Za-z0-9][A-Za-z0-9.-]+(:\d+)?(/.*)?',
            'hostnames':
            r'\b(([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])\.)+([A-Za-z0-9] |[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])\b'
        }

        if self.utils.file_exist('default/eventgen.conf'):
            eventgen_expr = self.utils.get_all_stanza('default/eventgen.conf')
            for expr in eventgen_expr:
                sample_files = self.utils.get_files('samples', expr)
                for sf in sample_files:
                    for rn, rr in rules.items():
                        words = self.utils.get_all_values('samples' + '/' + sf,
                                                          rr, 0)
                        for w in words:
                            r1 = _create_result(8090, {'file': sf,
                                                       'field_type': rn,
                                                       'field_value': w})
                            self.logger.info(r1)
                            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8091)
        results.append(r1)

    def test_app_check_for_updates(self, results=None):
        if results is None:
            results = []

        result = self.utils.check_line_in_stanza('default/app.conf',
                                                 'package',
                                                 'check_for_updates\\s*=\\s*(false|0)')
        if result is True:
            r1 = _create_result(8092)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8093)
        results.append(r1)

    def test_eventgen_not_reference_sa_eventgen_sample(self, results=None):
        if results is None:
            results = []

        result = self.utils.get_all_values('default/eventgen.conf', '(SA-Eventgen)')

        if len(result) > 0:
            r1 = _create_result(8094)
            self.logger.info(r1)
            results.append(r1)

        assert len(results) == 0
        r1 = _create_result(8095)
        results.append(r1)
