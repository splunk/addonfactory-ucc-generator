import os
import re


class Matinal():

    stanza_pattern = '^\s*\[(.*)\]\s*$'

    def __init__(self, ta_base_folder):
        self.ta_base_folder = ta_base_folder

    def file_exist(self, file_name):
        file_path = os.path.join(self.ta_base_folder, file_name)
        return os.path.isfile(file_path)

    def dir_exist(self, dir_name):
        dir_path = os.path.join(self.ta_base_folder, dir_name)
        return os.path.isdir(dir_path)

    def check_line_in_stanza(self, file_name, stanza_name, line_regx):
        file_path = os.path.join(self.ta_base_folder, file_name)

        stanza_re = re.compile(self.stanza_pattern)
        line_re = re.compile(line_regx)

        if os.path.isfile(file_path):
            f = open(file_path, 'r')

            check_line = False
            while True:
                line = f.readline()
                if not line:
                    break

                ma = stanza_re.search(line)
                if ma:
                    check_line = ma.group(1) == stanza_name
                    continue

                if check_line:
                    ma = line_re.search(line)
                    if ma:
                        f.close()
                        return True
            f.close()
        return False

    def get_all_stanza(self, file_name):
        file_path = os.path.join(self.ta_base_folder, file_name)
        stanza_list = []

        if os.path.isfile(file_path):
            f = open(file_path, 'r')

            stanza_re = re.compile(self.stanza_pattern)

            while True:
                line = f.readline()
                if not line:
                    break

                ma = stanza_re.search(line)

                if ma:
                    stanza_list.append(ma.group(1))

            f.close()

        return stanza_list

    def has_global_definition(self, file_name):
        file_path = os.path.join(self.ta_base_folder, file_name)

        if os.path.isfile(file_path):
            f = open(file_path, 'r')
            stanza_re = re.compile(self.stanza_pattern)

            while True:
                line = f.readline()
                if not line:
                    break

                ma = stanza_re.search(line)

                if ma:
                    break

                if line.find('=') >= 0 and line.lstrip().find('#') != 0:
                    f.close()
                    return True
            f.close()
        return False

    def get_all_values(self, file_name, pattern, group_no=1):
        file_path = os.path.join(self.ta_base_folder, file_name)

        value_list = []
        if os.path.isfile(file_path):
            f = open(file_path, 'r')

            re1 = re.compile(pattern)

            while True:
                line = f.readline()
                if not line:
                    break

                ma = re1.search(line)

                if ma:
                    value_list.append(ma.group(group_no))

            f.close()
        return value_list

    def get_all_values_in_stanza(self, file_name, stanza_name, pattern):
        file_path = os.path.join(self.ta_base_folder, file_name)
        value_list = []
        if os.path.isfile(file_path):
            f = open(file_path, 'r')

            re1 = re.compile(pattern)
            re2 = re.compile(self.stanza_pattern)

            is_stanza = False

            while True:
                line = f.readline()
                if not line:
                    break

                ma = re2.search(line)

                if ma:
                    is_stanza = ma.group(1) == stanza_name
                    continue

                if is_stanza:
                    ma = re1.search(line)

                    if ma:
                        value_list.append(ma.group(1))

            f.close()
        return value_list

    def get_files(self, folder_name, file_filter):
        file_list = []
        folder_path = os.path.join(self.ta_base_folder, folder_name)
        if os.path.isdir(folder_path):
            list1 = os.listdir(folder_path)
            re1 = re.compile(file_filter)
            for item in list1:
                if re1.match(item) and os.path.isfile(os.path.join(self.ta_base_folder, folder_name, item)):
                    file_list.append(item)
        return file_list

    def get_file_full_path(self, file_name):
        return os.path.join(self.ta_base_folder, file_name)

    def get_all_sourcetype(self):
        props_header_regex = re.compile('^\[(host|source|rule|delayedrule)?(::)?(.*)\]')
        key_value_regex = re.compile('(\S*)\s*=\s*(\S*)')
        sourcetype_set = set()
        curr_sourcetype = None

        props_conf_path = os.path.join(self.ta_base_folder, 'package', 'default', 'props.conf')

        if not os.path.isfile(props_conf_path):
            #print 'No props.conf under', default_path
            return sourcetype_set

        with open(props_conf_path) as f:
            for line in f:
                # Process stanza header
                ma1 = props_header_regex.search(line)
                if ma1:
                    if curr_sourcetype:
                        sourcetype_set.add(curr_sourcetype)
                    if ma1.group(1) is None and ma1.group(3):
                        # No wild card in sourcetype
                        s = re.compile('[\*\?]')
                        if not s.search(ma1.group(3)):
                            curr_sourcetype = ma1.group(3)
                    continue
                ma2 = key_value_regex.search(line)
                if ma2:
                    key1 = ma2.group(1)
                    value1 = ma2.group(2)

                    if key1 == 'rename' or key1 == 'sourcetype':
                        # Process rename configuration
                        curr_sourcetype = value1

            if curr_sourcetype:
                sourcetype_set.add(curr_sourcetype)

        return sourcetype_set

